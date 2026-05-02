import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AnimatePresence, motion } from 'motion/react';
import { User as UserIcon, ShieldCheck, Lock, Book, PenLine, History, PieChart, LogOut, Sparkles } from 'lucide-react';
import { UserProfile } from './types';
import Editor from './components/Editor';
import Timeline from './components/Timeline';
import Stats from './components/Stats';
import { cn } from './lib/utils';
import PinLock from './components/PinLock';
import { PinLockProvider, usePinLock } from './components/PinLockProvider';
import Settings from './components/Settings';
import Home from './components/Home';

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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'write' | 'timeline' | 'stats' | 'settings'>('home');

  const { savedPin, setIsSettingPin, setIsLocked } = usePinLock();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          const newProfile = {
            userId: user.uid,
            email: user.email || '',
            nickname: user.displayName || '',
            photoURL: user.photoURL || '',
            streak: 0,
            lastWroteAt: null,
            settings: { notificationTime: '21:00', darkMode: true },
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile as unknown as UserProfile);
        } else {
          setProfile(userDoc.data() as UserProfile);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-night-950"><Sparkles className="animate-spin text-copper w-12 h-12" /></div>;

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 text-center">
        <Book className="w-20 h-20 text-copper mb-8" />
        <h1 className="text-5xl font-serif font-bold mb-4 text-stone-100">StoryDiary</h1>
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())} className="bg-stone-100 text-night-950 px-8 py-4 rounded-2xl font-bold flex items-center gap-3">
          Continue with Google
        </button>
      </div>
    );
  }

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
          {activeTab === 'home' && <Home userName={profile?.nickname || 'Writer'} onStart={() => setActiveTab('write')} onViewHistory={() => setActiveTab('timeline')} onViewStats={() => setActiveTab('stats')} />}
          {activeTab === 'write' && <Editor userId={user.uid} profile={profile} />}
          {activeTab === 'timeline' && <Timeline userId={user.uid} />}
          {activeTab === 'stats' && <Stats profile={profile} />}
          {activeTab === 'settings' && <Settings profile={profile} onUpdate={setProfile} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
