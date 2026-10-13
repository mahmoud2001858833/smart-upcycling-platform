/**
 * Daily Project Generation Quota Tracker
 * Ensures each account has a strict limit of 2 projects per day.
 * Automatically resets at 00:00 midnight local time.
 */

const DAILY_LIMIT_STORAGE_KEY = 'mudam_daily_project_limit_v2';
export const MAX_DAILY_PROJECTS = 2;

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyProjectsUsed(userId = 'guest') {
  try {
    const raw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const userRecord = data[userId || 'guest'];
    if (!userRecord || userRecord.date !== getTodayKey()) {
      return 0;
    }
    return Math.max(0, Number(userRecord.count) || 0);
  } catch {
    return 0;
  }
}

export function getRemainingDailyProjects(userId = 'guest') {
  const used = getDailyProjectsUsed(userId);
  return Math.max(0, MAX_DAILY_PROJECTS - used);
}

export function recordProjectGeneration(userId = 'guest') {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem(DAILY_LIMIT_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const current = (data[userId || 'guest']?.date === today) 
      ? (Number(data[userId || 'guest']?.count) || 0) 
      : 0;
    
    const newCount = current + 1;
    data[userId || 'guest'] = {
      date: today,
      count: newCount
    };
    localStorage.setItem(DAILY_LIMIT_STORAGE_KEY, JSON.stringify(data));
    return Math.max(0, MAX_DAILY_PROJECTS - newCount);
  } catch {
    return 0;
  }
}
