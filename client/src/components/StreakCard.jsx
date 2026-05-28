import { Flame } from 'lucide-react';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const StreakCard = ({ stats }) => {
  const { currentStreak, longestStreak, dailyActivity } = stats;

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5'>
      {/* TOP */}
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>Current Streak</p>

          <div className='mt-1 flex items-end gap-2'>
            <h2 className='text-3xl font-bold leading-none text-white'>{currentStreak}</h2>

            <span className='pb-0.5 text-sm text-slate-400'>days</span>
          </div>
        </div>

        <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10'>
          <Flame className='h-5 w-5 text-rose-400' />
        </div>
      </div>

      {/* WEEK ACTIVITY */}
      <div className='mt-4 flex items-center justify-between'>
        {dailyActivity.map((day, index) => {
          const active = day.solved > 0;

          return (
            <div key={index} className='flex flex-col items-center gap-1'>
              <div
                title={`${day.solved} solved`}
                className={`h-6 w-6 rounded-md transition-all duration-200 ${active ? 'bg-rose-500' : 'bg-white/5'}`}
              />

              <span className='text-[10px] text-slate-500'>{DAY_LABELS[index]}</span>
            </div>
          );
        })}
      </div>

      {/* BOTTOM */}
      <div className='mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-3 py-2'>
        <span className='text-sm text-slate-400'>Longest Streak</span>

        <span className='text-sm font-semibold text-white'>{longestStreak} days</span>
      </div>
    </div>
  );
};

export default StreakCard;
