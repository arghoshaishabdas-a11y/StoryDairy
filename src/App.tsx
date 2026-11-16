import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Book, PenLine, History, PieChart, ShieldCheck } from 'lucide-react';
import { UserProfile } from './types';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import Stats from './components/Stats';
import { cn } from './lib/utils';
import PinLock from './components/PinLock';
import { PinLockProvider, usePinLock } from './components/PinLockProvider';
import Settings from './components/Settings';
import Home from './components/Home';

// No login: the diary belongs to whoever uses this device, and the profile lives in localStorage.
const PROFILE_KEY = 'storydiary:profile';
const LOCAL_USER_ID = 'local';

const defaultProfile = (): UserProfile => ({
  userId: LOCAL_USER_ID,
  email: '',
  nickname: '',
  photoURL: '',
  streak: 0,
  lastWroteAt: null,
  settings: { notificationTime: '21:00', darkMode: true },
  createdAt: new Date().toISOString(),
});

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {}
  return defaultProfile();
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

function AppContent() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [activeTab, setActiveTab] = useState<'home' | 'write' | 'timeline' | 'stats' | 'settings'>('home');

  const { savedPin, setIsSettingPin, setIsLocked } = usePinLock();

  useEffect(() => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  }, [profile]);

  return (
    <div className="min-h-screen md:pl-24">
      <nav className="fixed bottom-0 md:left-0 md:top-0 md:w-24 w-full bg-night-900/80 backdrop-blur-xl border-t md:border-r border-white/10 z-50 flex md:flex-col items-center justify-around py-4">
        {[
          { id: 'home', icon: Book },
          { id: 'write', icon: PenLine },
          { id: 'timeline', icon: History },
          { id: 'stats', icon: PieChart },
          { id: 'settings', icon: UserIcon }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={cn("p-3 rounded-2xl", activeTab === tab.id ? "bg-copper text-white" : "text-stone-500")}>
            <tab.icon size={24} />
          </button>
        ))}
        <button onClick={() => savedPin ? setIsLocked(true) : setIsSettingPin(true)} className="p-3 text-stone-500">
          {savedPin ? <Lock size={24} /> : <ShieldCheck size={24} />}
        </button>
      </nav>

      <main className="max-w-4xl mx-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Home userName={profile.nickname || 'Writer'} onStart={() => setActiveTab('write')} onViewHistory={() => setActiveTab('timeline')} onViewStats={() => setActiveTab('stats')} />}
          {activeTab === 'write' && <Editor userId={LOCAL_USER_ID} profile={profile} />}
          {activeTab === 'timeline' && <Timeline userId={LOCAL_USER_ID} />}
          {activeTab === 'stats' && <Stats profile={profile} />}
          {activeTab === 'settings' && <Settings profile={profile} onUpdate={setProfile} />}
        </AnimatePresence>
      </main>
    </div>
  );
          }
