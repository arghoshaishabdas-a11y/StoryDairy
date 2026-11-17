import { useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import type { DiaryEntry } from '../types';
import { MOODS, cn, wordCount } from '../lib/utils';

interface Props {
  entry: DiaryEntry | null;
  onSave: (data: { title: string; content: string; mood: string }) => void;
  onCancel: () => void;
}

export default function Editor({ entry, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [content, setContent] = useState(entry?.content ?? '');
  const [mood, setMood] = useState(entry?.mood ?? 'happy');
  const [preview, setPreview] = useState(false);

  const canSave = content.trim().length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
      <h1 className="text-3xl font-serif text-white">{entry ? 'Edit entry' : 'New entry'}</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full bg-transparent border-b border-white/10 focus:border-copper outline-none text-2xl font-serif text-white py-2"
      />

      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={cn('px-4 py-2 rounded-full text-sm border transition', mood === m.id ? 'bg-copper text-night-950 border-copper' : 'border-white/10 text-stone-400 hover:border-white/30')}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-4">
        {preview ? (
          <div className="md-body min-h-[16rem] text-stone-200">
            <ReactMarkdown>{content || '*Nothing to preview yet.*'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story… (Markdown supported)"
            className="premium-scroll w-full min-h-[16rem] bg-transparent outline-none resize-y text-stone-200 leading-relaxed"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => canSave && onSave({ title: title.trim(), content, mood })} disabled={!canSave} className="bg-copper disabled:opacity-40 text-night-950 font-semibold px-6 py-3 rounded-2xl">
          Save entry
        </button>
        <button onClick={() => setPreview((p) => !p)} className="px-5 py-3 rounded-2xl border border-white/10 text-stone-300">
          {preview ? 'Edit' : 'Preview'}
        </button>
        {entry && (
          <button onClick={onCancel} className="px-5 py-3 text-stone-500 hover:text-stone-300">Cancel</button>
        )}
        <span className="ml-auto text-stone-500 text-sm">{wordCount(content)} words</span>
      </div>
    </motion.div>
  );
}
