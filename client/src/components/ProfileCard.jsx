import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const getRankLabel = elo => {
  if (elo >= 10000) return 'Grandmaster';
  if (elo >= 5000) return 'Master';
  if (elo >= 1500) return 'Solver';
  if (elo >= 150) return 'Explorer';
  return 'Novice';
};

const ProfileCard = ({ user }) => {
  const eloRating = user.eloRating ?? 0;
  const rankLabel = getRankLabel(eloRating);
  const imageUrl = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 backdrop-blur-xl'>
      {/* ── Avatar + Name ── */}
      <Link to='/profile' className='flex items-center gap-4 transition hover:opacity-80'>
        <div className='relative shrink-0'>
          <img src={imageUrl} alt={`${user.displayName}'s profile`} className='h-16 w-16 rounded-full border border-white/10 object-cover' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='truncate text-lg font-semibold text-white'>{user.displayName}</p>
          <p className='mt-0.5 truncate text-sm text-slate-400'>@{user.username}</p>
        </div>
      </Link>

      {/* ── Rank Chip ── */}
      <div className='mt-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3.5'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300'>
          <Sparkles className='h-5 w-5' />
        </div>

        <div className='min-w-0'>
          <p className='truncate text-xs text-slate-400'>Community rank</p>
          <p className='truncate text-base font-semibold text-white'>{rankLabel}</p>
        </div>

        <div className='ml-auto shrink-0 text-right'>
          <p className='text-xs text-slate-400'>ELO</p>
          <p className='text-base font-semibold text-rose-400'>{eloRating}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
