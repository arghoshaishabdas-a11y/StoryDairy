import type { DiaryEntry } from '../types';

export const PROFILE_KEY = 'storydiary:profile';
export const ENTRIES_KEY = 'storydiary:entries';
export const PIN_KEY = 'storydiary:pin';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}

export function loadEntries(): DiaryEntry[] {
  const data = readJSON<unknown>(ENTRIES_KEY, []);
  return Array.isArray(data) ? (data as DiaryEntry[]) : [];
}
