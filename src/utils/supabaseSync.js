import { supabase } from '../supabaseClient';

/**
 * Service to sync user projects, profiles, and certificates with Supabase
 * Provides transparent fallback to localStorage if offline or not logged in.
 */

const LOCAL_STORAGE_SAVED_KEY = 'smart_upcycling_saved_projects_v3';
const LOCAL_STORAGE_PROFILE_KEY = 'smart_upcycling_user_profile_v3';

// 1. Fetch user saved projects
export async function getSavedProjects(userId) {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('saved_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data.map(item => ({
          ...item,
          // ensure backwards compatibility with client format
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

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 2. Save a project to Supabase & localStorage
export async function saveProjectToCloud(userId, project) {
  // Update local storage first for instant feedback
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SAVED_KEY) || '[]');
    const exists = current.some(p => p.id === project.id || p.name === project.name);
    const updated = exists ? current : [project, ...current];
    localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local storage write failed:', e);
  }

  if (userId) {
    try {
      const row = {
        user_id: userId,
        title: project.name || project.title || 'مشروع إعادة تدوير',
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
