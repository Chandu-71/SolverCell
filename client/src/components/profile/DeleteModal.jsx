import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteModal = ({ problemTitle, loading = false, onConfirm, onClose }) => {
  // close on Escape key
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='w-full max-w-sm overflow-hidden rounded-2xl border border-white/8 bg-[#111] shadow-2xl shadow-black/80'>
        {/* icon + title */}
        <div className='px-6 pt-6 pb-4 text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10'>
            <AlertTriangle size={22} className='text-red-400' />
          </div>
          <h2 className='text-base font-semibold text-white'>Delete Problem</h2>
          <p className='mt-2 text-sm leading-relaxed text-slate-400'>
            Are you sure you want to delete <span className='font-semibold text-white'>"{problemTitle}"</span>?
            <br />
            This action cannot be undone.
          </p>
        </div>

        {/* actions */}
        <div className='flex gap-3 border-t border-white/6 px-6 py-4'>
          <button
            onClick={onClose}
            disabled={loading}
            className='flex-1 cursor-pointer rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-white disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className='flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60'
          >
            {loading ? (
              <>
                <Loader2 size={14} className='animate-spin' /> Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
