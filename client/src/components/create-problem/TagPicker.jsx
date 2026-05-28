import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { ALL_TAGS } from '../../assets/assets';

const TagPicker = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = ALL_TAGS.filter(t => t.toLowerCase().includes(query.toLowerCase()) && !selected.includes(t));

  const add = tag => {
    if (selected.length < 8) onChange([...selected, tag]);
  };
  const remove = tag => onChange(selected.filter(t => t !== tag));

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap gap-2'>
        {selected.map(tag => (
          <span key={tag} className='flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1 text-sm text-red-300'>
            #{tag}
            <button onClick={() => remove(tag)} className='cursor-pointer text-red-400/60 transition-colors hover:text-red-300'>
              <X size={12} />
            </button>
          </span>
        ))}

        {selected.length < 8 && (
          <button
            onClick={() => setOpen(v => !v)}
            className='flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-white/15 px-3 py-1 text-sm text-slate-500 transition hover:border-white/30 hover:text-slate-300'
          >
            <Plus size={13} /> Add tag
          </button>
        )}
      </div>

      {open && (
        <div className='relative'>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search tags…'
            className='w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-red-500/40'
          />
          <div className='mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/8 bg-[#141414] shadow-xl shadow-black/60'>
            {filtered.length === 0 && <p className='px-4 py-3 text-sm text-slate-600'>No tags found</p>}
            {filtered.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  add(tag);
                  setQuery('');
                }}
                className='flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white'
              >
                #{tag}
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(false)} className='mt-1 cursor-pointer text-xs text-slate-600 hover:text-slate-400'>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default TagPicker;
