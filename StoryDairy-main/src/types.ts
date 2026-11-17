export interface UserProfile {
  userId: string;
  email: string;
  nickname: string;
  photoURL: string;
  streak: number;
  lastWroteAt: string | null;
  settings: { notificationTime: string; darkMode: boolean };
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
  updatedAt: string;
}

export type Tab = 'home' | 'write' | 'timeline' | 'stats' | 'settings';
