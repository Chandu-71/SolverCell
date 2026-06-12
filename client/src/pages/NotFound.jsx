import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Terminal, Bug, FileCode, Compass } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex min-h-screen items-center justify-center bg-black px-4'>
      <div className='relative z-10 text-center'>
        {/* 404 Display */}
        <div className='mb-8'>
          <div className='relative inline-block'>
            <h1 className='text-[150px] font-black leading-none tracking-tighter text-white/5 md:text-[200px]'>404</h1>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='flex items-center gap-4'>
                <Terminal size={48} className='text-red-500/30' />
                <h2 className='text-6xl font-black text-white md:text-7xl'>404</h2>
                <Bug size={48} className='text-red-500/30' />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className='mb-8 space-y-4'>
          <h3 className='text-2xl font-bold text-white md:text-3xl'>Page Not Found</h3>
          <p className='mx-auto max-w-md text-slate-400'>
            The page you're looking for might have been deleted, renamed, or never existed in the first place.
          </p>
        </div>

        {/* Code Block */}
        <div className='mx-auto mb-8 max-w-md'>
          <div className='rounded-xl border border-white/10 bg-[#0a0a0a] p-4 text-left font-mono text-sm shadow-lg shadow-black/50'>
            <div className='mb-3 ml-2 text-xs text-slate-600'>error.log</div>
            <div className='space-y-1'>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>1</span>
                <span>
                  <span className='text-purple-400'>try</span>
                  <span className='text-slate-400'> {'{'}</span>
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>2</span>
                <span>
                  <span className='ml-4 text-blue-400'>navigate</span>
                  <span className='text-slate-400'>(</span>
                  <span className='text-emerald-400'>"/nonexistent-page"</span>
                  <span className='text-slate-400'>);</span>
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>3</span>
                <span className='text-slate-400'>{'}'}</span>
              </div>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>4</span>
                <span>
                  <span className='text-purple-400'>catch</span>
                  <span className='text-slate-400'> (</span>
                  <span className='text-amber-400'>error</span>
                  <span className='text-slate-400'>) {'{'}</span>
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>5</span>
                <span>
                  <span className='ml-4 text-red-400'>console</span>
                  <span className='text-slate-400'>.</span>
                  <span className='text-blue-400'>error</span>
                  <span className='text-slate-400'>(</span>
                  <span className='text-emerald-400'>"404: Page not found"</span>
                  <span className='text-slate-400'>);</span>
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='select-none text-slate-700'>6</span>
                <span className='text-slate-400'>{'}'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <button
            onClick={() => navigate('/')}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-medium text-white transition-all hover:bg-red-600 sm:w-auto'
          >
            <Home size={18} />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/discover')}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-300 transition-all hover:border-white/20 hover:bg-white/10 active:scale-95 sm:w-auto'
          >
            <Compass size={18} />
            Explore Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
