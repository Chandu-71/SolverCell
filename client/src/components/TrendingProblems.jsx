import { TrendingUp, Users } from 'lucide-react';

const DIFFICULTY_STYLES = {
  Easy: 'bg-emerald-500/10 text-emerald-300',
  Medium: 'bg-amber-500/10 text-amber-300',
  Hard: 'bg-rose-500/10 text-rose-300',
};

const TrendingProblems = ({ problems }) => {
  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 backdrop-blur-xl'>
      {/* header */}
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-slate-400'>Trending</p>
          <h2 className='mt-1.5 text-lg font-semibold text-white'>Hot Problems</h2>
        </div>
        <TrendingUp className='h-5 w-5 text-rose-400' />
      </div>

      <div className='space-y-2.5'>
        {problems.map((problem, i) => (
          <div
            key={problem.id}
            className='group cursor-pointer rounded-2xl border border-white/5 bg-white/5 p-3.5 transition-all duration-200 hover:border-white/10'
          >
            {/* rank + title */}
            <div className='flex items-start gap-3'>
              <span className='mt-0.5 text-xs font-bold text-slate-600'>#{i + 1}</span>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-white group-hover:text-rose-300 transition-colors'>{problem.title}</p>
                {/* first tag as topic */}
                <p className='mt-0.5 text-xs text-slate-500'>{problem.tags[0]}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[problem.difficulty]}`}
              >
                {problem.difficulty}
              </span>
            </div>

            {/* stats row */}
            <div className='mt-3 flex items-center justify-between text-xs text-slate-500'>
              <span className='flex items-center gap-1'>
                <Users size={11} />
                {problem.successfulSolves.toLocaleString()} solves
              </span>
              <span className='flex items-center gap-1 text-rose-300'>
                <TrendingUp size={11} />+{problem.trend}% this week
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingProblems;
