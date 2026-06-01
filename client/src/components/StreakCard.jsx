import { Flame, Trophy } from 'lucide-react';

const StreakCard = ({ user }) => {
  const { currentStreak = 0, longestStreak = 0 } = user;

  const solvedToday = user.lastSolvedAt ? new Date(user.lastSolvedAt).toDateString() === new Date().toDateString() : false;

  const formatDays = count => (count === 1 ? 'day' : 'days');

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 backdrop-blur-xl'>
      <div className='flex items-center justify-between gap-4'>
        {/* Current Streak */}
        <div className='flex items-center gap-3'>
          <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 ease-out ${
              solvedToday ? 'border-red-500/30 bg-red-500/10' : 'border-white/5 bg-white/5'
            }`}
          >
            <Flame
              className={`h-6 w-6 transition-all duration-500 ease-out ${
                solvedToday ? 'fill-red-500/20 text-red-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'text-slate-500'
              }`}
              strokeWidth={solvedToday ? 2 : 1.5}
            />
          </div>
          <div>
            <p className='text-sm font-medium text-slate-400'>Current Streak</p>
            <p className='text-2xl font-bold text-white'>
              {currentStreak} <span className='text-base font-normal text-slate-500'>{formatDays(currentStreak)}</span>
            </p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className='text-right'>
          <div className='flex items-center justify-end gap-1.5 text-slate-400'>
            <Trophy size={14} className='text-amber-400' />
            <p className='text-sm font-medium'>Best</p>
          </div>
          <p className='mt-0.5 text-lg font-semibold text-white'>
            {longestStreak} <span className='text-sm font-normal text-slate-500'>{formatDays(longestStreak)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
