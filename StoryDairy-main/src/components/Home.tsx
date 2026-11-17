import { motion } from 'motion/react';
import type { DiaryEntry } from '../types';
import { calcStreaks, formatDate, moodEmoji } from '../lib/utils';

interface Props {
  userName: string;
  entries: DiaryEntry[];
  onStart: () => void;
  onViewHistory: () => void;
  onViewStats: () => void;
}

export default function Home({ userName, entries, onStart, onViewHistory, onViewStats }: Props) {
  const { current } = calcStreaks(entries);
  const last = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
      <div>
        <p className="text-copper text-sm uppercase tracking-widest">{greeting}</p>
        <h1 className="text-4xl md:text-5xl font-serif text-white mt-2">{userName}, what's your story today?</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={onViewHistory} className="glass-card p-6 text-left hover:border-copper/40 transition">
          <p className="text-3xl font-serif text-white">{entries.length}</p>
          <p className="text-stone-400 text-sm">Entries</p>
        </button>
        <button onClick={onViewStats} className="glass-card p-6 text-left hover:border-copper/40 transition">
          <p className="text-3xl font-serif text-white">{current} 🔥</p>
          <p className="text-stone-400 text-sm">Day streak</p>
        </button>
      </div>

      <button onClick={onStart} className="bg-copper hover:bg-emerald-400 text-night-950 font-semibold px-8 py-4 rounded-2xl transition">
        Write today's entry
      </button>

      {last && (
        <div className="glass-card p-6 space-y-2">
          <p className="text-stone-500 text-xs uppercase tracking-widest">Last entry · {formatDate(last.createdAt)}</p>
          <h2 className="text-xl font-serif text-white">{moodEmoji(last.mood)} {last.title || 'Untitled'}</h2>
          <p className="text-stone-400 line-clamp-3 whitespace-pre-wrap">{last.content}</p>
        </div>
      )}
    </motion.div>
  );
}
