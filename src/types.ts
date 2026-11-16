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
