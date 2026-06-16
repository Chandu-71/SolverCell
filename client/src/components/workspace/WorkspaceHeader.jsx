import React from 'react';
import { Play, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatTimeAgo = dateString => {
  const now = new Date();
  const posted = new Date(dateString);

  const seconds = Math.floor((now - posted) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;

  return 'Just now';
};

const WorkspaceHeader = ({ problem, onRun, runLoading, onSubmit, submitLoading }) => {
  const navigate = useNavigate();
  const author = problem.author;

  return (
    <header className='flex h-14 lg:h-16 items-center justify-between px-3 lg:px-6 border-b border-white/6 lg:border-none'>
      {/* LEFT */}
      <div className='flex items-center gap-2 lg:gap-10 min-w-0'>
        {/* Profile Group */}
        <div onClick={() => navigate(`/profile/${author?.username}`)} className='group flex cursor-pointer items-center gap-2 lg:gap-3 min-w-0'>
          <img
            src={author?.avatarUrl}
            alt={author?.username || 'user'}
            className='h-8 w-8 lg:h-9 lg:w-9 shrink-0 rounded-full border border-white/10 object-cover transition-colors group-hover:border-red-400 group-hover:border-2'
          />

          <div className='min-w-0'>
            <h3 className='truncate text-xs lg:text-sm font-medium text-white transition-colors group-hover:text-red-400'>{author?.username}</h3>
            <p className='text-[10px] sm:text-xs text-slate-500'>Posted {formatTimeAgo(problem?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className='flex items-center gap-2 lg:gap-3 shrink-0'>
        {/* RUN */}
        <button
          onClick={onRun}
          disabled={runLoading}
          className='flex cursor-pointer items-center gap-1.5 lg:gap-2 rounded-lg lg:rounded-xl border border-white/6 bg-white/3 px-3 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-sm font-medium text-white transition-all duration-200 hover:border-white/10 hover:bg-white/5 disabled:opacity-70'
        >
          <Play className='h-3 w-3 lg:h-4 lg:w-4 shrink-0' />
          <span>{runLoading ? 'Running' : 'Run'}</span>
        </button>

        {/* SUBMIT */}
        <button
          onClick={onSubmit}
          disabled={submitLoading}
          className='flex cursor-pointer items-center gap-1.5 lg:gap-2 rounded-lg lg:rounded-xl bg-red-500 px-3 py-1.5 lg:px-5 lg:py-2 text-xs lg:text-sm font-semibold text-white transition-all duration-200 hover:bg-red-400 disabled:opacity-70'
        >
          <Send className='h-3 w-3 lg:h-4 lg:w-4 shrink-0' />
          <span>{submitLoading ? 'Submit' : 'Submit'}</span>
        </button>
      </div>

      {/* RIGHT */}
      <button
        onClick={() => navigate(-1)}
        className='flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg lg:rounded-xl border border-white/6 bg-white/3 text-slate-400 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-white'
      >
        <X className='h-4 w-4 lg:h-5 lg:w-5' />
      </button>
    </header>
  );
};

export default WorkspaceHeader;
