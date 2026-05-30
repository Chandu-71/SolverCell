import { Flame, Trophy } from 'lucide-react';

const StreakCard = ({ user }) => {
  const { currentStreak = 0, longestStreak = 0 } = user;

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 backdrop-blur-xl'>
      <div className='flex items-center justify-between gap-4'>
        {/* Current Streak */}
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400'>
            <Flame className='h-6 w-6' />
          </div>
          <div>
            <p className='text-sm font-medium text-slate-400'>Current Streak</p>
            <p className='text-2xl font-bold text-white'>
              {currentStreak} <span className='text-base font-normal text-slate-500'>days</span>
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
            {longestStreak} <span className='text-sm font-normal text-slate-500'>days</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
