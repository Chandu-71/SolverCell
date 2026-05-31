import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Loader2, Flame } from 'lucide-react';

const DIFFICULTY = {
  Easy: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  Medium: { dot: 'bg-amber-400', text: 'text-amber-400' },
  Hard: { dot: 'bg-red-400', text: 'text-red-400' },
};

const TrendingProblems = () => {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/trending?limit=7`);
        const data = await res.json();

        if (data.success) {
          setProblems(data.problems);
        }
      } catch (error) {
        console.error('Trending fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Trending Problems</h2>
          <p className='mt-0.5 text-sm text-slate-500'>Based on recent community activity</p>
        </div>

        <TrendingUp size={16} className='text-red-400' />
      </div>

      {loading ? (
        <div className='flex justify-center py-8'>
          <Loader2 size={18} className='animate-spin text-red-500' />
        </div>
      ) : problems.length === 0 ? (
        <div className='py-8 text-center text-sm text-slate-500'>No trending problems yet</div>
      ) : (
        <div className='space-y-1.5'>
          {problems.map((problem, index) => {
            const diff = DIFFICULTY[problem.difficulty] || DIFFICULTY.Medium;
            const authorUsername = problem.author?.username || 'Unknown';

            return (
              <button
                key={problem.id}
                onClick={() => navigate(`/problem/${problem.id}`)}
                className='group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left cursor-pointer transition bg-white/3 hover:bg-white/5'
              >
                {/* Left Side: Rank & Content */}
                <div className='flex items-center gap-3 min-w-0 flex-1'>
                  {/* Rank */}
                  <div className='w-5 shrink-0 text-center'>
                    <span className='text-xs font-bold text-slate-500'>#{index + 1}</span>
                  </div>

                  {/* Content */}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-white transition-colors group-hover:text-red-400' title={problem.title}>
                      {problem.title}
                    </p>

                    <div className='mt-1 flex items-center gap-2 text-xs'>
                      <span className='flex items-center gap-1 shrink-0'>
                        <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
                        <span className={diff.text}>{problem.difficulty}</span>
                      </span>

                      <span className='text-slate-600 shrink-0'>•</span>

                      <span className='truncate text-slate-500' title={`@${authorUsername}`}>
                        @{authorUsername}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Score */}
                <div className='flex items-center gap-1.5 shrink-0 pl-2 rounded-md px-2 py-1' title='Trending Activity Score'>
                  <Flame size={14} className='text-orange-500' />
                  <span className='text-xs font-semibold text-slate-300'>{problem.trendingScore}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendingProblems;
