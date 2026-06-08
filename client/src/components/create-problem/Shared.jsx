import { AlertCircle } from 'lucide-react';

// ─── Shared style constants ───────────────────────────────────
export const DIFF_STYLE = {
  Easy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Medium: 'border-amber-500/30 bg-amber-500/10   text-amber-400',
  Hard: 'border-red-500/30     bg-red-500/10     text-red-400',
};

export const inputCls =
  'w-full rounded-xl border border-white/8 bg-[#141414] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10';

export const uid = () => crypto.randomUUID();

// ─── Section ─────────────────────────────────────────────────
export const Section = ({ number, title, subtitle, children, error }) => (
  <div className='rounded-2xl border border-white/6 bg-[#0b0b0b] p-6'>
    <div className='mb-5 flex items-start gap-4'>
      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-sm font-bold text-red-400'>{number}</span>
      <div>
        <h2 className='text-base font-semibold text-white'>{title}</h2>
        {subtitle && <p className='mt-0.5 text-sm text-slate-500'>{subtitle}</p>}
        {error && (
          <p className='mt-1.5 flex items-center gap-1.5 text-xs text-red-400'>
            <AlertCircle size={12} /> {error}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
);

// ─── Field ────────────────────────────────────────────────────
export const Field = ({ label, required, hint, error, children }) => (
  <div className='space-y-2'>
    <label className='flex items-center gap-1.5 text-sm font-medium text-slate-300'>
      {label}
      {required && <span className='text-red-400'>*</span>}
      {hint && <span className='ml-1 text-xs font-normal text-slate-600'>({hint})</span>}
    </label>
    {children}
    {error && (
      <p className='flex items-center gap-1.5 text-xs text-red-400'>
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);
