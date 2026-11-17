import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Pencil, Trash2 } from 'lucide-react';
import type { DiaryEntry } from '../types';
import { formatDate, moodEmoji, wordCount } from '../lib/utils';

interface Props {
  entries: DiaryEntry[];
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
}

export default function Timeline({ entries, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      <h1 className="text-3xl font-serif text-white">Timeline</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your entries…"
        className="w-full bg-white/5 border border-white/10 focus:border-copper outline-none rounded-2xl px-4 py-3 text-white"
      />

      {list.length === 0 && <p className="text-stone-500">{entries.length === 0 ? 'No entries yet. Write your first story!' : 'No matches found.'}</p>}

      <div className="space-y-4">
        {list.map((e) => {
          const open = openId === e.id;
          return (
            <div key={e.id} className="glass-card p-5 space-y-3">
              <button className="w-full text-left" onClick={() => setOpenId(open ? null : e.id)}>
                <p className="text-stone-500 text-xs uppercase tracking-widest">{formatDate(e.createdAt)} · {wordCount(e.content)} words</p>
                <h2 className="text-xl font-serif text-white mt-1">{moodEmoji(e.mood)} {e.title || 'Untitled'}</h2>
                {!open && <p className="text-stone-400 line-clamp-2 mt-1 whitespace-pre-wrap">{e.content}</p>}
              </button>
              {open && (
                <div className="md-body text-stone-200">
                  <ReactMarkdown>{e.content}</ReactMarkdown>
                </div>
              )}
              <div className="flex gap-4 text-stone-500">
                <button onClick={() => onEdit(e)} className="flex items-center gap-1 text-sm hover:text-copper"><Pencil size={14} /> Edit</button>
                <button
                  onClick={() => { if (window.confirm('Delete this entry?')) onDelete(e.id); }}
                  className="flex items-center gap-1 text-sm hover:text-red-400"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
