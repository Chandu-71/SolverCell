import { useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';

const DIFF_STYLE = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const SharedPostCard = ({ problem, isMine }) => {
  const navigate = useNavigate();

  if (!problem) return null;

  const difficultyStyle =
    DIFF_STYLE[problem.difficulty] ||
    'text-slate-400 bg-white/5 border-white/10';

  return (
    <div
      onClick={() => navigate(`/problem/${problem.id}`)}
      className={`mt-1.5 cursor-pointer rounded-xl border p-3 transition-all duration-200 ${
        isMine
          ? 'border-white/15 bg-red-800 hover:bg-red-800/50'
          : 'border-white/8 bg-white/4 hover:bg-white/8 hover:border-white/12'
      }`}
    >
      <div className='flex items-start gap-2.5'>
        {/* icon */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
            isMine
              ? 'border-white/20 bg-white/10'
              : 'border-red-500/10 bg-red-500/15'
          }`}
        >
          <Code2
            size={15}
            className={isMine ? 'text-white' : 'text-red-400'}
          />
        </div>

        {/* content */}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-white'>
            {problem.title}
          </p>

          <p
            className={`mt-0.5 line-clamp-2 text-xs ${
              isMine ? 'text-white/80' : 'text-slate-300'
            }`}
          >
            {problem.summary || 'Open this shared problem on SolverCell'}
          </p>
        </div>
      </div>

      {/* metadata */}
      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${difficultyStyle}`}
        >
          {problem.difficulty || 'Unknown'}
        </span>

        {problem.tags?.slice(0, 2).map(tag => (
          <span
            key={tag}
            className={`rounded-md border px-2 py-0.5 text-xs ${
              isMine
                ? 'border-white/15 bg-white/10 text-white/80'
                : 'border-white/6 bg-white/2 text-slate-400'
            }`}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* footer */}
      <p
        className={`mt-2.5 text-xs font-medium ${
          isMine ? 'text-white/90' : 'text-red-400'
        }`}
      >
        Open problem →
      </p>
    </div>
  );
};

export default SharedPostCard;