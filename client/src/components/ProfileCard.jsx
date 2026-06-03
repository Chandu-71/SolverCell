import { Link } from 'react-router-dom';
import { Zap, Trophy, Medal } from 'lucide-react';

const ProfileCard = ({ user }) => {
  const eloRating = user.eloRating ?? 0;
  const currentRank = user.currentRank ?? null;
  const bestRank = user.bestRank ?? null;

  return (
    <div className='rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl shadow-black/40'>
      {/* avatar + name */}
      <Link to='/profile' className='group flex items-center gap-4 transition-all hover:opacity-80'>
        <div className='relative shrink-0'>
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.displayName}
            className='h-16 w-16 rounded-full border border-white/10 object-cover'
          />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='truncate text-lg font-bold tracking-tight text-white'>{user.displayName}</p>
          <p className='mt-0.5 truncate text-sm font-medium text-slate-400'>@{user.username}</p>
        </div>
      </Link>

      {/* Unified Stats Container */}
      <div className='mt-5 flex divide-x divide-white/5 rounded-xl border border-white/5 bg-white/2'>
        {/* ELO */}
        <div className='flex flex-1 flex-col items-center p-3'>
          <div className='flex items-center gap-1.5'>
            <Zap size={14} className='text-amber-400' />
            <p className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>ELO</p>
          </div>
          <p className='mt-1.5 text-base font-bold text-white'>{eloRating}</p>
        </div>

        {/* Current Rank */}
        <div className='flex flex-1 flex-col items-center p-3'>
          <div className='flex items-center gap-1.5'>
            <Trophy size={14} className='text-rose-400' />
            <p className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Weekly</p>
          </div>
          <p className='mt-1.5 text-base font-bold text-white'>{currentRank != null ? `#${currentRank}` : '—'}</p>
        </div>

        {/* Best Rank */}
        <div className='flex flex-1 flex-col items-center p-3'>
          <div className='flex items-center gap-1.5'>
            <Medal size={14} className='text-sky-400' />
            <p className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Best</p>
          </div>
          <p className='mt-1.5 text-base font-bold text-white'>{bestRank != null ? `#${bestRank}` : '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
