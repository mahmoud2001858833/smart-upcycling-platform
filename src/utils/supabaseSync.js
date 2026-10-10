import { stripHeavyImages } from './aiImageStore.js';
import { supabase } from '../supabaseClient';

/**
 * Service to sync user projects, profiles, and certificates with Supabase
 * Provides transparent fallback to localStorage if offline or not logged in.
 */

const LOCAL_STORAGE_SAVED_KEY = 'smart_upcycling_saved_projects_v3';
const LOCAL_STORAGE_PROFILE_KEY = 'smart_upcycling_user_profile_v3';

// Helper to normalize project titles for deduplication comparison
export function normalizeProjectTitle(title = '') {
  return (title || '')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .replace(/\s+/g, ' ');
}

// 1. Fetch user saved projects with strict deduplication
export async function getSavedProjects(userId) {
  let list = [];
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        list = data.map(item => ({
          ...item,
          name: item.title || item.name,
          title: item.title || item.name,
          idea: item.description || item.idea,
          materials: typeof item.materials === 'string' ? item.materials : (item.materials?.join?.(', ') || ''),
          tools: item.tools || 'أدوات حرفية قياسية',
          time: item.estimated_time || item.time || 'ساعتان',
          difficulty: item.difficulty || 'متوسط'
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch saved projects failed, falling back to local storage:', err);
    }
  }

  // Fallback to local storage if cloud is empty or offline
  if (list.length === 0) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      list = raw ? JSON.parse(raw) : [];
    } catch {
      list = [];
    }
  }

  // Strict Deduplication: filter out any repeated projects by normalized title
  const uniqueMap = new Map();
  for (const item of list) {
    const rawTitle = item.title || item.name || '';
    const normKey = normalizeProjectTitle(rawTitle);
    if (normKey && !uniqueMap.has(normKey)) {
      uniqueMap.set(normKey, {
        ...item,
        title: rawTitle,
        name: rawTitle
      });
    }
  }

  const deduplicatedList = Array.from(uniqueMap.values());

  // Keep local storage clean and deduplicated as well
  try {
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(deduplicatedList));
  } catch (e) {
    // Ignore local storage quota
  }

  return deduplicatedList;
}

// 2. Save a project to Supabase & localStorage (Zero Duplicates Guaranteed)
export async function saveProjectToCloud(userId, rawProject) {
  if (!rawProject) return { success: false };
  const project = stripHeavyImages(rawProject);

  const projectTitle = (project.name || project.title || 'مشروع إعادة تدوير').trim();
  const normTitle = normalizeProjectTitle(projectTitle);

  // 1. Update local storage first, ensuring NO duplicate exists
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_KEY) || '[]');
    const existsLocally = current.some(p => {
      const pNorm = normalizeProjectTitle(p.name || p.title || '');
      return pNorm === normTitle || (p.id && project.id && p.id === project.id);
    });

    if (!existsLocally) {
      const updated = [{ ...project, name: projectTitle, title: projectTitle }, ...current];
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Local storage write failed:', e);
  }

  // 2. Save to Supabase Cloud only if not already saved!
  if (userId) {
    try {
      // Check if project with this title already exists in cloud for this user
      const { data: existingRows } = await supabase
        .from('saved_projects')
        .select('id, title')
        .eq('user_id', userId);

      const alreadyInCloud = Array.isArray(existingRows) && existingRows.some(row => 
        normalizeProjectTitle(row.title) === normTitle
      );

      if (alreadyInCloud) {
        // Project already exists in Supabase - return existing without creating duplicates
        return { success: true, savedProject: project, alreadySaved: true };
      }

      const row = {
        user_id: userId,
        title: projectTitle,
        description: project.idea || project.description || '',
        difficulty: project.difficulty || 'متوسط',
        estimated_time: project.time || 'ساعتان',
        materials: Array.isArray(project.materials) ? project.materials : [project.materials],
        steps: project.parsedSteps || (typeof project.steps === 'string' ? [{ title: 'خطوات التنفيذ', detail: project.steps }] : project.steps || []),
        lca_metrics: project.metrics || {},
        image_url: project.generatedImage || project.gallery?.finished || null
      };

      const { data, error } = await supabase
        .from('saved_projects')
        .insert([row])
        .select();

      if (error) {
        console.warn('Could not insert project into Supabase:', error.message);
      } else if (data?.[0]) {
        return { success: true, savedProject: { ...project, id: data[0].id } };
      }
    } catch (err) {
      console.warn('Supabase save error:', err);
    }
  }

  return { success: true, savedProject: project };
}

// 3. Delete a saved project
export async function deleteProjectFromCloud(userId, projectId) {
  // Update local storage
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_KEY) || '[]');
    const filtered = current.filter(p => p.id !== projectId);
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Local storage update failed:', e);
  }

  if (userId && projectId) {
    try {
      await supabase
        .from('saved_projects')
        .delete()
        .eq('id', projectId);
    } catch (err) {
      console.warn('Supabase delete error:', err);
    }
  }

  return { success: true };
}

// 4. Fetch user profile stats (points, completed projects, co2 offset)
export async function getUserProfileStats(userId) {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('environmental_points, completed_projects, co2_saved_kg')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return {
          points: data.environmental_points ?? 40,
          completed: data.completed_projects ?? 1,
          co2Saved: Number(data.co2_saved_kg ?? 0)
        };
      }
    } catch (err) {
      console.warn('Profile stats fetch error:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : { points: 40, completed: 1, co2Saved: 0 };
  } catch {
    return { points: 40, completed: 1, co2Saved: 0 };
  }
}

// 5. Update user profile stats
export async function updateUserProfileStats(userId, { points, completed, co2Saved }) {
  // Update local
  try {
    const data = { points, completed, co2Saved };
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Profile local save error:', e);
  }

  if (userId) {
    try {
      await supabase
        .from('profiles')
        .update({
          environmental_points: points,
          completed_projects: completed,
          co2_saved_kg: co2Saved,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (err) {
      console.warn('Supabase profile update error:', err);
    }
  }
}

// 6. Explicitly sync/upsert registered user into profiles table
export async function syncUserProfileRecord(user, extraMetadata = {}) {
  if (!user?.id) return null;
  const fullName = extraMetadata.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'مبتكر بيئي';
  const role = extraMetadata.role || user.user_metadata?.role || 'student';
  const school = extraMetadata.school || user.user_metadata?.school || 'المنصة الوطنية للتدوير والابتكار';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.id)}`;

  // Save to localStorage for instant offline PWA access
  try {
    const cachedProfile = {
      id: user.id,
      email,
      full_name: fullName,
      role,
      school,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(cachedProfile));
  } catch (e) {
    console.warn('Profile cache error:', e);
  }

  // Upsert to Supabase profiles table
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        school: school,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase profile upsert notice (fallback to local state):', error.message);
    }
    return data?.[0] || null;
  } catch (err) {
    console.warn('Profile upsert exception:', err);
    return null;
  }
}

