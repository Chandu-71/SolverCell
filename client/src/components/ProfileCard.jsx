import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import useCurrentUser from '../hooks/useCurrentUser';

// Derives a "Top X%" label from eloRating
const getRankLabel = elo => {
  if (elo >= 2000) return 'Top 1%';
  if (elo >= 1800) return 'Top 5%';
  if (elo >= 1600) return 'Top 15%';
  if (elo >= 1400) return 'Top 30%';
  if (elo >= 1200) return 'Top 50%';
  return 'Top 75%';
};

const ProfileCard = () => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { user: dbUser, loading: isDbLoading } = useCurrentUser();

  // ── Derive data from Clerk and Backend (matching schema.prisma) ──
  const imageUrl = dbUser?.avatarUrl || clerkUser?.imageUrl;
  const displayName = dbUser?.displayName || clerkUser?.fullName || 'Anonymous';
  const username = dbUser?.username || 'user';

  // Using nullish coalescing (??) so it respects an ELO of 0 if they drop that low,
  // but defaults to 1000 matching Prisma @default(1000)
  const eloRating = dbUser?.eloRating ?? 1000;
  const rankLabel = getRankLabel(eloRating);

  return (
    <div className='rounded-xl border border-white/10 bg-[#0d0d0d] p-5 shadow-xl shadow-black/20 backdrop-blur-xl'>
      {/* ── Avatar + Name ── */}
      <Link to='/profile' className='flex items-center gap-4 transition hover:opacity-80'>
        <div className='relative shrink-0'>
          <img src={imageUrl} alt={`${displayName}'s profile`} className='h-16 w-16 rounded-full border border-white/10 object-cover' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='truncate text-base font-semibold text-white'>{displayName}</p>
          <p className='mt-0.5 truncate text-sm text-slate-400'>@{username}</p>
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
