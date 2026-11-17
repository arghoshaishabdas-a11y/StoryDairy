import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Book, PenLine, History, PieChart, ShieldCheck } from 'lucide-react';
import type { DiaryEntry, Tab, UserProfile } from './types';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import Stats from './components/Stats';
import Settings from './components/Settings';
import Home from './components/Home';
import PinLock from './components/PinLock';
import { PinLockProvider, usePinLock } from './components/PinLockProvider';
import { cn, newId } from './lib/utils';
import { ENTRIES_KEY, PROFILE_KEY, loadEntries, readJSON, writeJSON } from './lib/storage';

// No login: the diary belongs to whoever uses this device, and everything lives in localStorage.
const defaultProfile = (): UserProfile => ({
  userId: 'local',
  email: '',
  nickname: '',
  photoURL: '',
  streak: 0,
  lastWroteAt: null,
  settings: { notificationTime: '21:00', darkMode: true },
  createdAt: new Date().toISOString(),
});

function loadProfile(): UserProfile {
  return { ...defaultProfile(), ...readJSON<Partial<UserProfile>>(PROFILE_KEY, {}) };
}

export default function App() {
  return (
    <PinLockProvider>
      <PinLock>
        <AppContent />
      </PinLock>
    </PinLockProvider>
  );
}

const TABS: { id: Tab; icon: typeof Book }[] = [
  { id: 'home', icon: Book },
  { id: 'write', icon: PenLine },
  { id: 'timeline', icon: History },
  { id: 'stats', icon: PieChart },
  { id: 'settings', icon: UserIcon },
];

function AppContent() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [entries, setEntries] = useState<DiaryEntry[]>(loadEntries);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [editing, setEditing] = useState<DiaryEntry | null>(null);

  const { savedPin, setIsSettingPin, setIsLocked } = usePinLock();

  useEffect(() => { writeJSON(PROFILE_KEY, profile); }, [profile]);
  useEffect(() => { writeJSON(ENTRIES_KEY, entries); }, [entries]);

  const goTo = (tab: Tab) => {
    if (tab !== 'write') setEditing(null);
    setActiveTab(tab);
  };

  const handleSave = (data: { title: string; content: string; mood: string }) => {
    const now = new Date().toISOString();
    if (editing) {
      setEntries((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...data, updatedAt: now } : e)));
    } else {
      setEntries((prev) => [...prev, { id: newId(), ...data, createdAt: now, updatedAt: now }]);
    }
    setEditing(null);
    setActiveTab('timeline');
  };

  return (
    <div className="min-h-screen md:pl-24">
      <nav className="fixed bottom-0 md:left-0 md:top-0 md:w-24 w-full bg-night-900/80 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 z-50 flex md:flex-col items-center justify-around py-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => goTo(tab.id)}
            aria-label={tab.id}
            className={cn('p-3 rounded-2xl', activeTab === tab.id ? 'bg-copper text-white' : 'text-stone-500')}
          >
            <tab.icon size={24} />
          </button>
        ))}
        <button
          onClick={() => (savedPin ? setIsLocked(true) : setIsSettingPin(true))}
          aria-label="lock"
          className="p-3 text-stone-500"
        >
          {savedPin ? <Lock size={24} /> : <ShieldCheck size={24} />}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-8 pb-28 md:pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <Home key="home" userName={profile.nickname || 'Writer'} entries={entries} onStart={() => goTo('write')} onViewHistory={() => goTo('timeline')} onViewStats={() => goTo('stats')} />
          )}
          {activeTab === 'write' && (
            <Editor key={editing?.id ?? 'new'} entry={editing} onSave={handleSave} onCancel={() => goTo('timeline')} />
          )}
          {activeTab === 'timeline' && (
            <Timeline
              key="timeline"
              entries={entries}
              onEdit={(e) => { setEditing(e); setActiveTab('write'); }}
              onDelete={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
            />
          )}
          {activeTab === 'stats' && <Stats key="stats" profile={profile} entries={entries} />}
          {activeTab === 'settings' && (
            <Settings key="settings" profile={profile} entries={entries} onUpdate={setProfile} onImport={setEntries} onClear={() => setEntries([])} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
