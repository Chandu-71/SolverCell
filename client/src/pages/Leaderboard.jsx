import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Trophy, Loader2, Crown, Star, Medal } from 'lucide-react';
import LeftSidebar from '../components/LeftSidebar';

// ─── constants ────────────────────────────────────────────────
const RANK_ROW_STYLE = {
  1: 'border-amber-500/30 bg-amber-500/5',
  2: 'border-slate-400/20 bg-slate-400/4',
  3: 'border-amber-800/30 bg-amber-900/5',
};

const RANK_NUM_STYLE = {
  1: 'text-amber-400 font-extrabold text-lg',
  2: 'text-slate-300 font-bold text-base',
  3: 'text-amber-700 font-bold text-base',
};

// ─── MyRankCard ───────────────────────────────────────────────
const MyRankCard = ({ entry, isWeekly }) => {
  if (!entry) return null;

  return (
    <div className='rounded-2xl border border-red-500/20 bg-red-500/5 p-4'>
      <div className='flex items-center gap-4'>
        <img
          src={entry.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
          alt={entry.displayName}
          className='h-12 w-12 rounded-full border-2 border-red-500/30 object-cover'
        />
        <div className='min-w-0 flex-1'>
          <p className='font-semibold text-white'>{entry.displayName}</p>
          <p className='text-sm text-slate-400'>@{entry.username}</p>
        </div>

        {/* rank badge */}
        <div className='text-right'>
          <p className='text-2xl font-extrabold text-red-400'>#{entry.rank}</p>
          {!entry.inTop100 && <p className='text-xs text-slate-500'>Top {entry.percentile}%</p>}
        </div>
      </div>

      <div className='mt-3 flex items-center gap-6 border-t border-white/6 pt-3 text-sm'>
        {isWeekly ? (
          <>
            <span className='text-slate-400'>
              Current Rank: <span className='font-semibold text-white'>#{entry.rank}</span>
            </span>
            <span className='text-slate-400'>
              Current Score: <span className='font-semibold text-white'>{entry.weeklyScore} pts</span>
            </span>
            <span className='text-slate-400'>
              Best Weekly Rank: <span className='font-semibold text-white'>{entry.bestRank != null ? `#${entry.bestRank}` : '—'}</span>
            </span>
          </>
        ) : (
          <>
            <span className='text-slate-400'>
              Current ELO: <span className='font-semibold text-white'>{entry.eloRating}</span>
            </span>
            <span className='text-slate-400'>
              All-Time Rank: <span className='font-semibold text-white'>#{entry.rank}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// ─── LeaderboardRow ───────────────────────────────────────────
const LeaderboardRow = ({ entry, isMe, isWeekly }) => {
  const navigate = useNavigate();

  const getRankIcon = rank => {
    if (rank === 1) return <Crown size={16} className='text-amber-400' />;
    if (rank === 2) return <Medal size={16} className='text-slate-300' />;
    if (rank === 3) return <Medal size={16} className='text-amber-700' />;
    return null;
  };

  const rowStyle = isMe ? 'border-red-500/25 bg-red-500/5' : (RANK_ROW_STYLE[entry.rank] ?? 'border-white/5 bg-transparent hover:bg-white/3');

  return (
    <div
      onClick={() => navigate(`/profile/${entry.username}`)}
      className={`flex cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 transition-all ${rowStyle}`}
    >
      {/* rank */}
      <div className='w-10 shrink-0 text-center flex items-center justify-center gap-1'>
        {getRankIcon(entry.rank) ? (
          <>
            {getRankIcon(entry.rank)}
            <span className={RANK_NUM_STYLE[entry.rank] ?? 'text-slate-500 text-sm'}>{entry.rank}</span>
          </>
        ) : (
          <span className={RANK_NUM_STYLE[entry.rank] ?? 'text-slate-500 text-sm'}>#{entry.rank}</span>
        )}
      </div>

      {/* avatar + name */}
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <img
          src={entry.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
          alt={entry.displayName}
          className='h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover'
        />
        <div className='min-w-0'>
          <p className={`truncate text-sm font-semibold ${isMe ? 'text-red-300' : 'text-white'}`}>
            {entry.displayName}
            {isMe && <span className='ml-1.5 text-xs font-normal text-red-400/70'>(You)</span>}
          </p>
          <p className='truncate text-xs text-slate-600'>@{entry.username}</p>
        </div>
      </div>

      {/* score */}
      <div className='w-24 shrink-0 text-right'>
        <span className={`text-sm font-bold ${entry.rank <= 3 ? 'text-white' : 'text-slate-300'}`}>
          {isWeekly ? entry.weeklyScore : entry.eloRating}
        </span>
        <span className='ml-1.5 text-xs font-medium text-slate-600'>{isWeekly ? 'pts' : 'ELO'}</span>
      </div>
    </div>
  );
};

// ─── Leaderboard ─────────────────────────────────────────────
const Leaderboard = () => {
  const { getToken } = useAuth();
  const [tab, setTab] = useState('alltime');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [myDbId, setMyDbId] = useState(null);

  // get current user's DB id once for "you" highlighting
  useEffect(() => {
    const run = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setMyDbId(data.user.id);
      } catch {
        /* ignore */
      }
    };
    run();
  }, [getToken]);

  const fetchLeaderboard = useCallback(
    async activeTab => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard?tab=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
          setMyEntry(data.myEntry);
          setTotalUsers(data.totalUsers);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab, fetchLeaderboard]);

  const isWeekly = tab === 'weekly';

  return (
    <div className='flex min-h-screen bg-black text-white'>
      <aside className='hidden lg:block shrink-0'>
        <LeftSidebar />
      </aside>

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-3xl px-6 py-8'>
          {/* ── PAGE HEADER ── */}
          <div className='mb-6 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10'>
              <Trophy size={22} className='text-red-400' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-white'>Leaderboard</h1>
              <p className='text-sm text-slate-500'>{isWeekly ? 'Weekly rankings' : 'All-time rankings based on ELO'}</p>
            </div>
          </div>

          {/* ── YOUR RANK CARD ── */}
          {myEntry && (
            <div className='mb-6'>
              <MyRankCard entry={myEntry} isWeekly={isWeekly} />
            </div>
          )}

          {/* ── TABS ── */}
          <div className='mb-4 flex gap-2'>
            {[
              { id: 'alltime', label: 'All Time', icon: Crown },
              { id: 'weekly', label: 'Weekly', icon: Star },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'border border-white/8 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}

            <div className='ml-auto flex items-center gap-2 text-sm text-slate-600'>
              <span className='font-medium text-slate-400'>{totalUsers.toLocaleString()}</span>
              total players
            </div>
          </div>

          {/* ── COLUMN HEADERS ── */}
          <div className='mb-2 flex items-center gap-4 px-4 text-xs font-medium uppercase tracking-wider text-slate-700'>
            <span className='w-10 text-center'>Rank</span>
            <span className='flex-1'>Player</span>
            <span className='w-24 text-right'>{isWeekly ? 'Points' : 'ELO'}</span>
          </div>

          {/* ── LIST ── */}
          {loading ? (
            <div className='flex justify-center py-16'>
              <Loader2 size={24} className='animate-spin text-slate-600' />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className='rounded-2xl border border-white/6 p-16 text-center'>
              <Trophy size={32} className='mx-auto mb-3 text-slate-700' />
              <p className='text-slate-500'>No solvers yet — be the first!</p>
            </div>
          ) : (
            <div className='space-y-1.5'>
              {leaderboard.map(entry => (
                <LeaderboardRow key={entry.id} entry={entry} isMe={entry.id === myDbId} isWeekly={isWeekly} />
              ))}

              {/* if user is not in top 100, show a divider + their position */}
              {myEntry && !myEntry.inTop100 && (
                <>
                  <div className='flex items-center gap-3 py-2'>
                    <div className='flex-1 border-t border-dashed border-white/10' />
                    <span className='text-xs font-medium text-slate-600'>Your Position</span>
                    <div className='flex-1 border-t border-dashed border-white/10' />
                  </div>
                  <LeaderboardRow entry={myEntry} isMe={true} isWeekly={isWeekly} />
                </>
              )}
            </div>
          )}

          {/* weekly reset note */}
          {isWeekly && (
            <p className='mt-6 text-center text-xs text-slate-700'>
              Weekly scores reset every Monday at 00:00 UTC · ELO is permanent and never resets
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
