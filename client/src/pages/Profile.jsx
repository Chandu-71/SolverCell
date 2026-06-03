import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, MapPin, CalendarDays, Trophy, CircleCheckBig, Target, Flame, MessageSquare } from 'lucide-react';
import { useUser, useClerk, useAuth } from '@clerk/react';
import useCurrentUser from '../hooks/useCurrentUser';
import Loading from '../components/Loading';

import LeftSidebar from '../components/LeftSidebar';
import FollowModal from '../components/profile/FollowModal';
import EditProfileModal from '../components/profile/EditProfileModal';
import MyPosts from '../components/profile/MyPosts';

const Profile = () => {
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { openUserProfile, signOut } = useClerk();
  const { user: dbUser, loading } = useCurrentUser();
  const { username } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !username || username === dbUser?.username;

  // ── Profile State ─────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [publicUser, setPublicUser] = useState(null);
  const [publicLoading, setPublicLoading] = useState(false);

  // ── Stats State ───────────────────────────────────────────────
  const [solvedCount, setSolvedCount] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  // ── Modal State ───────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState(null);

  // ── Follow State ──────────────────────────────────────────────
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  // ── Calculate Stats ───────────────────────────────────────────
  const successRate = solvedCount + attemptedCount > 0 ? Math.round((solvedCount / (solvedCount + attemptedCount)) * 100) : 0;

  // ── Sync Local Profile State ──────────────────────────────────
  useEffect(() => {
    if (username && publicUser) {
      setProfile(publicUser);
    } else if (!username && dbUser) {
      setProfile({
        ...dbUser,
        avatarUrl: dbUser.avatarUrl || clerkUser?.imageUrl,
      });
    }
  }, [username, publicUser, dbUser, clerkUser]);

  // ── Fetch Public Profile ──────────────────────────────────────
  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!username) return;

      setPublicLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${username}`);
      const data = await res.json();

      if (data.success) {
        setPublicUser(data.user);
      }

      setPublicLoading(false);
    };

    fetchPublicProfile();
  }, [username]);

  // ── Fetch Follow Status ───────────────────────────────────────
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!username || isOwnProfile) return;

      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/follows/${username}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setIsFollowing(data.isFollowing);
      }
    };

    fetchFollowStatus();
  }, [username, isOwnProfile, getToken]);

  // ── Fetch Follow Data (Followers/Following) ───────────────────
  useEffect(() => {
    const fetchFollowData = async () => {
      const targetUsername = username || dbUser?.username;
      if (!targetUsername) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${targetUsername}/follow-data`);
      const data = await res.json();

      if (data.success) {
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
        setFollowers(data.followers);
        setFollowing(data.following);
      }
    };

    fetchFollowData();
  }, [username, dbUser?.username]);

  // ── Fetch Problems Data (for stats) ───────────────────────────
  useEffect(() => {
    const fetchProblemsData = async () => {
      const targetUsername = username || dbUser?.username;
      if (!targetUsername) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${targetUsername}/problems`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (data.success) {
        setSolvedCount(data.solved?.length || 0);
        setAttemptedCount(data.attempted?.length || 0);

        const totalLikes = (data.authored || []).reduce((sum, problem) => sum + (problem.likesCount || 0), 0);

        setLikesCount(totalLikes);
      }
    };

    fetchProblemsData();
  }, [username, dbUser?.username]);

  // ── Listen for Account Security Link ──────────────────────────
  useEffect(() => {
    const handler = () => openUserProfile();
    window.addEventListener('open-clerk-profile', handler);
    return () => window.removeEventListener('open-clerk-profile', handler);
  }, [openUserProfile]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleProfileSave = async updatedUser => {
    setProfile(updatedUser);

    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleFollowToggle = async () => {
    if (!username) return;

    setFollowLoading(true);

    const token = await getToken();
    const method = isFollowing ? 'DELETE' : 'POST';
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/follows/${username}`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => (isFollowing ? prev - 1 : prev + 1));
    }

    setFollowLoading(false);
  };

  const handleMessageClick = async () => {
    if (!profile?.username) return;

    setMessageLoading(true);

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUsername: profile.username }),
      });
      const data = await res.json();

      if (data.success) {
        navigate(`/messages/${data.conversation.id}`);
      } else {
        console.error('Failed to start conversation:', data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading || publicLoading || !profile) {
    return <Loading />;
  }

  // ── Widget Configuration ──────────────────────────────────────
  const eloRating = profile.eloRating ?? 0;
  const currentStreak = profile.currentStreak ?? 0;
  const longestStreak = profile.longestStreak ?? 0;
  const allTimeRank = profile.currentRank ?? null;
  const weeklyRank = profile.weeklyRank ?? null;
  const bestRank = profile.bestRank ?? null;

  const statsWidgets = [
    {
      label: 'Problems Solved',
      value: solvedCount,
      subtext: `${solvedCount + attemptedCount} attempted`,
      icon: CircleCheckBig,
      color: 'text-green-400',
    },
    {
      label: 'Current Streak',
      value: `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`,
      subtext: `Best: ${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      color: 'text-rose-400',
    },
    {
      label: 'Likes',
      value: likesCount,
      subtext: 'Total received',
      icon: Heart,
      color: 'text-rose-400',
    },
  ];

  return (
    <main className='min-h-screen bg-black text-white'>
      <div className='mx-auto flex gap-6'>
        {/* LEFT SIDEBAR */}
        <aside className='hidden lg:block'>
          <LeftSidebar />
        </aside>

        {/* MAIN PROFILE CONTENT */}
        <section className='min-w-0 flex-1 py-6 pr-6'>
          <div className='overflow-hidden rounded-3xl border border-white/5 bg-[#050505]'>
            <div className='p-8'>
              {/* HEADER ROW */}
              <div className='flex flex-col gap-8 sm:flex-row sm:items-center'>
                {/* AVATAR */}
                <div className='shrink-0 flex items-center justify-center'>
                  <img
                    src={profile.avatarUrl || '/default-avatar.png'}
                    alt={`${profile.username}'s profile`}
                    className='h-40 w-40 rounded-full border border-white/10 object-cover'
                  />
                </div>

                {/* USER INFO */}
                <div className='flex-1'>
                  <div className='flex flex-wrap items-start justify-between gap-4'>
                    <div>
                      <h1 className='text-2xl font-extrabold tracking-tight text-white'>{profile.displayName}</h1>
                      <p className='text-slate-400'>@{profile.username}</p>
                    </div>

                    <div className='flex items-center gap-3'>
                      {isOwnProfile ? (
                        <>
                          <button
                            onClick={() => setEditOpen(true)}
                            className='cursor-pointer rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10'
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={() => signOut(() => navigate('/login'))}
                            className='cursor-pointer rounded-full border border-red-500/10 bg-red-500/5 px-5 py-2 text-sm font-semibold text-red-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200'
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleMessageClick}
                            disabled={messageLoading}
                            className='flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 disabled:opacity-70'
                          >
                            <MessageSquare className='h-4 w-4' />
                            {messageLoading ? '...' : 'Message'}
                          </button>
                          <button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-70 ${
                              isFollowing ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500 hover:bg-red-600'
                            }`}
                          >
                            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* BIO */}
                  {profile.bio && <p className='mt-4 leading-relaxed text-slate-300'>{profile.bio}</p>}

                  {/* META */}
                  <div className='mt-4 flex flex-wrap gap-5 text-sm text-slate-400'>
                    {profile.location && (
                      <div className='flex items-center gap-1.5'>
                        <MapPin className='h-4 w-4' />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className='flex items-center gap-1.5'>
                      <CalendarDays className='h-4 w-4' />
                      <span>
                        Joined{' '}
                        {new Date(profile.joinedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* FOLLOW STATS */}
                  <div className='mt-5 flex gap-6 text-sm'>
                    <button onClick={() => setFollowModalType('following')} className='cursor-pointer text-left hover:underline'>
                      <span className='font-bold text-white'>{followingCount}</span> <span className='text-slate-400'>Following</span>
                    </button>
                    <button onClick={() => setFollowModalType('followers')} className='cursor-pointer text-left hover:underline'>
                      <span className='font-bold text-white'>{followersCount}</span> <span className='text-slate-400'>Followers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* STATS WIDGETS */}
              <div className='mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                {/* COMPETITIVE RATING WIDGET */}
                <div className='flex flex-col justify-between rounded-xl border border-white/5 bg-[#0b0b0b] p-3.5 transition hover:border-yellow-500/30 hover:bg-[#101010]'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-yellow-400'>
                      <Trophy className='h-4 w-4' />
                      <p className='text-xs text-slate-300'>Competitive</p>
                    </div>
                    <div className='flex items-baseline gap-1'>
                      <h3 className='text-lg font-bold text-white'>{eloRating}</h3>
                      <span className='text-[10px] font-medium text-slate-500'>ELO</span>
                    </div>
                  </div>

                  {/* Ranks */}
                  <div className='mt-2 flex items-center justify-between border-t border-white/5 pt-2'>
                    <div>
                      <p className='text-[10px] text-slate-400'>All-Time Rank</p>
                      <p className='text-xs font-bold text-white'>{allTimeRank != null ? `#${allTimeRank}` : '—'}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-slate-400'>Weekly Rank</p>
                      <p className='text-xs font-bold text-white'>{weeklyRank != null ? `#${weeklyRank}` : '—'}</p>
                    </div>
                    <div>
                      <p className='text-[10px] text-slate-400'>Best Weekly</p>
                      <p className='text-xs font-bold text-white'>{bestRank != null ? `#${bestRank}` : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* STANDARD WIDGETS */}
                {statsWidgets.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      className='flex flex-col justify-between rounded-xl border border-white/5 bg-[#0b0b0b] p-3.5 transition hover:border-red-500/10 hover:bg-[#101010]'
                    >
                      <div>
                        <div className={`flex items-center gap-2 ${stat.color}`}>
                          <Icon className='h-4 w-4' />
                          <p className='text-xs text-slate-300'>{stat.label}</p>
                        </div>
                        <h3 className='mt-2 text-lg font-bold text-white'>{stat.value}</h3>
                      </div>
                      <p className='mt-0.5 text-xs text-slate-400'>{stat.subtext}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <MyPosts key={profile.username} profile={profile} />
          </div>
        </section>
      </div>

      {/* ── MODALS ── */}
      {isOwnProfile && editOpen && <EditProfileModal user={profile} onClose={() => setEditOpen(false)} onSave={handleProfileSave} />}

      {followModalType && (
        <FollowModal
          title={followModalType === 'followers' ? 'Followers' : 'Following'}
          users={followModalType === 'followers' ? followers : following}
          onClose={() => setFollowModalType(null)}
          isOwnProfile={isOwnProfile}
        />
      )}
    </main>
  );
};

export default Profile;
