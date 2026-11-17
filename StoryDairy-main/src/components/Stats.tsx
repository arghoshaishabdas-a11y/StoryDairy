import { motion } from 'motion/react';
import type { DiaryEntry, UserProfile } from '../types';
import { MOODS, calcStreaks, dayKey, wordCount } from '../lib/utils';

interface Props {
  profile: UserProfile;
  entries: DiaryEntry[];
}

export default function Stats({ profile, entries }: Props) {
  const { current, longest } = calcStreaks(entries);
  const words = entries.reduce((sum, e) => sum + wordCount(e.content), 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = dayKey(d);
    return {
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: entries.filter((e) => dayKey(e.createdAt) === key).length,
    };
  });
  const maxCount = Math.max(1, ...last7.map((d) => d.count));
  const moodCounts = MOODS.map((m) => ({ ...m, count: entries.filter((e) => e.mood === m.id).length }));
  const maxMood = Math.max(1, ...moodCounts.map((m) => m.count));

  const cards = [
    { label: 'Entries', value: entries.length },
    { label: 'Words', value: words },
    { label: 'Current streak', value: `${current} 🔥` },
    { label: 'Longest streak', value: longest },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
      <h1 className="text-3xl font-serif text-white">{profile.nickname ? `${profile.nickname}'s stats` : 'Your stats'}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card p-5">
            <p className="text-2xl font-serif text-white">{c.value}</p>
            <p className="text-stone-400 text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-white font-serif text-xl mb-4">Last 7 days</h2>
        <div className="flex items-end gap-3 h-32">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <div className="w-full bg-copper/80 rounded-t-lg" style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? 6 : 2, opacity: d.count ? 1 : 0.2 }} />
              <span className="text-xs text-stone-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="text-white font-serif text-xl">Moods</h2>
        {moodCounts.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="w-24 text-sm text-stone-400">{m.emoji} {m.label}</span>
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-copper rounded-full" style={{ width: `${(m.count / maxMood) * 100}%` }} />
            </div>
            <span className="w-6 text-right text-sm text-stone-400">{m.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
