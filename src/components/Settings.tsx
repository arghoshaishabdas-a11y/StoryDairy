import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { DiaryEntry, UserProfile } from '../types';
import { usePinLock } from './PinLockProvider';

interface Props {
  profile: UserProfile;
  entries: DiaryEntry[];
  onUpdate: (p: UserProfile) => void;
  onImport: (entries: DiaryEntry[]) => void;
  onClear: () => void;
}

const cardCls = 'glass-card p-6 space-y-4';
const inputCls = 'bg-white/5 border border-white/10 focus:border-copper outline-none rounded-xl px-4 py-2 text-white';
const btnCls = 'px-5 py-2 rounded-xl border border-white/10 text-stone-200 hover:border-copper/50 transition';

export default function Settings({ profile, entries, onUpdate, onImport, onClear }: Props) {
  const { savedPin, setIsSettingPin, removePin } = usePinLock();
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storydiary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error('bad');
      const valid = data.filter((e) => e && typeof e.id === 'string' && typeof e.content === 'string') as DiaryEntry[];
      onImport(valid);
      setMessage(`Imported ${valid.length} entries.`);
    } catch {
      setMessage('Could not read that file.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      <h1 className="text-3xl font-serif text-white">Settings</h1>

      <div className={cardCls}>
        <h2 className="text-white font-serif text-xl">Profile</h2>
        <label className="block text-sm text-stone-400">
          Nickname
          <input value={profile.nickname} onChange={(e) => onUpdate({ ...profile, nickname: e.target.value })} placeholder="Writer" className={`${inputCls} block w-full mt-1`} />
        </label>
        <label className="block text-sm text-stone-400">
          Reminder time
          <input
            type="time"
            value={profile.settings.notificationTime}
            onChange={(e) => onUpdate({ ...profile, settings: { ...profile.settings, notificationTime: e.target.value } })}
            className={`${inputCls} block mt-1`}
          />
        </label>
      </div>

      <div className={cardCls}>
        <h2 className="text-white font-serif text-xl">Privacy</h2>
        <p className="text-stone-400 text-sm">{savedPin ? 'A PIN protects your diary.' : 'Protect your diary with a 4-digit PIN.'}</p>
        <div className="flex gap-3">
          <button className={btnCls} onClick={() => setIsSettingPin(true)}>{savedPin ? 'Change PIN' : 'Set PIN'}</button>
          {savedPin && <button className={btnCls} onClick={removePin}>Remove PIN</button>}
        </div>
      </div>

      <div className={cardCls}>
        <h2 className="text-white font-serif text-xl">Your data</h2>
        <p className="text-stone-400 text-sm">Everything is stored only in this browser. Export a backup now and then.</p>
        <div className="flex flex-wrap gap-3">
          <button className={btnCls} onClick={exportData}>Export backup</button>
          <button className={btnCls} onClick={() => fileRef.current?.click()}>Import backup</button>
          <button
            className="px-5 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => { if (window.confirm('Delete ALL entries? This cannot be undone.')) { onClear(); setMessage('All entries deleted.'); } }}
          >
            Delete everything
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); e.target.value = ''; }} />
        {message && <p className="text-copper text-sm">{message}</p>}
      </div>
    </motion.div>
  );
}
