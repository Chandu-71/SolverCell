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
    <header className='flex h-16 items-center justify-between px-6'>
      {/* LEFT */}
      <div className='flex items-center gap-10'>
        {/* Profile Group: Wraps avatar and text for synchronized hover and click */}
        <div onClick={() => navigate(`/profile/${author?.username}`)} className='group flex cursor-pointer items-center gap-3'>
          <img
            src={author?.avatarUrl || '/default-avatar.png'}
            alt={author?.username || 'user'}
            className='h-9 w-9 rounded-full border border-white/10 object-cover transition-colors group-hover:border-red-400 group-hover:border-2'
          />

          <div>
            <h3 className='text-sm font-medium text-white transition-colors group-hover:text-red-400'>{author?.username}</h3>
            <p className='text-xs text-slate-500'>Posted {formatTimeAgo(problem?.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div className='flex items-center gap-3'>
        {/* RUN */}
        <button
          onClick={onRun}
          disabled={runLoading}
          className='flex cursor-pointer items-center gap-2 rounded-xl border border-white/6 bg-white/3 px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:border-white/10 hover:bg-white/5 disabled:opacity-70'
        >
          <Play className='h-4 w-4' />
          {runLoading ? 'Running...' : 'Run'}
        </button>

        {/* SUBMIT */}
        <button
          onClick={onSubmit}
          disabled={submitLoading}
          className='flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-400 disabled:opacity-70'
        >
          <Send className='h-4 w-4' />
          {submitLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* RIGHT */}
      <button
        onClick={() => navigate(-1)}
        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/6 bg-white/3 text-slate-400 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-white'
      >
        <X className='h-5 w-5' />
      </button>
    </header>
  );
};

export default WorkspaceHeader;
