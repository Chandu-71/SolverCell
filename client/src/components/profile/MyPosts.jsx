import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Grid3X3, Heart, MessageCircle, CircleCheckBig, Target, Users, Share2, Bookmark } from 'lucide-react';
import ShareModal from '../ShareModal'; // Adjust import path if needed based on your folder structure

// ─── helpers ────────────────────────────────────────────────
const timeAgo = iso => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const DIFFICULTY_CONFIG = {
  Easy: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  Medium: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  Hard: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', dot: 'bg-red-400' },
};

const MyPosts = ({ profile }) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: dbUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [savedProblems, setSavedProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [shareProblem, setShareProblem] = useState(null); // Tracks which problem to share

  const isOwnProfile = dbUser?.username && profile?.username && dbUser.username === profile.username;

  const updateProblemShares = (problemId, delta) => {
    const updateList = list => list.map(item => (item.id === problemId ? { ...item, sharesCount: (item.sharesCount || 0) + delta } : item));
    setPosts(prev => updateList(prev));
    setSolvedProblems(prev => updateList(prev));
    setAttemptedProblems(prev => updateList(prev));
  };

  // fetch real posts and problem data
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile?.username) return;

      setLoading(true);

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${profile.username}/problems`, {
          cache: 'no-store',
        });

        const data = await res.json();

        if (data.success) {
          setPosts(data.authored || []);
          setSolvedProblems(data.solved || []);
          setAttemptedProblems(data.attempted || []);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [profile?.username]);

  const displayedProblems =
    activeTab === 'posts' ? posts : activeTab === 'saved' ? savedProblems : activeTab === 'solved' ? solvedProblems : attemptedProblems;

  useEffect(() => {
    if (!isOwnProfile) {
      return;
    }

    const fetchSavedProblems = async () => {
      setSavedLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/bookmarks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setSavedProblems(data.problems);
        }
      } catch (error) {
        console.error('Error loading saved problems:', error);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSavedProblems();
  }, [isOwnProfile, getToken]);

  if (loading) {
    return <div className='p-10 text-center text-slate-500'>Loading...</div>;
  }

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Grid3X3 },
    ...(isOwnProfile ? [{ id: 'saved', label: 'Saved', icon: Bookmark }] : []),
    { id: 'solved', label: 'Solved', icon: CircleCheckBig },
    { id: 'attempted', label: 'Attempted', icon: Target },
  ];

  const handleBookmarkToggle = (problem, savedState) => {
    if (!isOwnProfile) return;
    if (activeTab === 'saved') {
      if (!savedState) {
        setSavedProblems(prev => prev.filter(p => p.id !== problem.id));
      } else {
        setSavedProblems(prev => [problem, ...prev.filter(p => p.id !== problem.id)]);
      }
    }
  };

  const ProblemCardItem = ({ problem, index }) => {
    const [saved, setSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
      const fetchSaveStatus = async () => {
        try {
          const token = await getToken();
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/save-status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            setSaved(data.saved);
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchSaveStatus();
    }, [problem.id, getToken]);

    const handleSaveToggle = async () => {
      try {
        setSaveLoading(true);
        const token = await getToken();
        const method = saved ? 'DELETE' : 'POST';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/save`, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setSaved(data.saved);
          handleBookmarkToggle(problem, data.saved);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSaveLoading(false);
      }
    };

    const author =
      isOwnProfile && problem.author.id === profile.id
        ? {
            ...problem.author,
            avatarUrl: profile.avatarUrl,
            displayName: profile.displayName,
            username: profile.username,
          }
        : problem.author;

    return (
      <article
        key={problem.id}
        className='rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 transition-all duration-300 hover:border-red-500/25 hover:bg-[#111]'
        style={{ animationDelay: `${index * 60}ms` }}
      >
        {/* Author Info & Badges Header */}
        <div className='flex items-start justify-between gap-3'>
          {/* Clickable group for Author Avatar + Name */}
          <div
            onClick={() => author.username && navigate(`/profile/${author.username}`)}
            className='flex items-center gap-3 cursor-pointer group/author'
          >
            <div className='relative'>
              <img
                src={problem.author.id === profile.id ? profile.avatarUrl : problem.author.avatarUrl}
                alt={author.displayName || 'User'}
                className='h-11 w-11 rounded-full object-cover ring-2 ring-white/10 transition-all duration-200 group-hover/author:opacity-80 group-hover/author:ring-red-500'
              />
            </div>

            <div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-white transition-colors duration-200 group-hover/author:text-red-400'>
                  {author.displayName || 'Unknown User'}
                </span>
                <span className='text-xs text-slate-500'>@{author.username || 'unknown'}</span>
              </div>
              <span className='text-xs text-slate-600'>{timeAgo(problem.createdAt)}</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {problem.difficulty && (
              <span
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${DIFFICULTY_CONFIG[problem.difficulty]?.bg} ${DIFFICULTY_CONFIG[problem.difficulty]?.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${DIFFICULTY_CONFIG[problem.difficulty]?.dot}`} />
                {problem.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* Problem Title & Summary */}
        <div onClick={() => navigate(`/problem/${problem.id}`)} className='mt-4 hover:cursor-pointer group/title'>
          <h2 className='text-lg font-bold leading-snug text-white transition-colors duration-200 group-hover/title:text-red-400'>{problem.title}</h2>
          <p className='mt-2 text-sm leading-relaxed text-slate-400'>{problem.summary}</p>
        </div>

        <div className='mt-4 flex flex-wrap gap-1.5'>
          {problem.tags?.map(tag => (
            <span
              key={tag}
              className='rounded-md border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs text-slate-400 transition-colors hover:border-red-500/30 hover:text-red-300'
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className='mt-4 space-y-1.5'>
          <div className='flex items-center justify-between text-xs text-slate-500'>
            <span className='flex items-center gap-1'>
              <Users size={11} />
              {(problem.totalAttempts || 0).toLocaleString()} submissions
            </span>
            <span>{problem.totalAttempts > 0 ? Math.round((problem.successfulSolves / problem.totalAttempts) * 100) : 0}% acceptance rate</span>
          </div>

          <div className='h-1 w-full overflow-hidden rounded-full bg-white/6'>
            <div
              className='h-full rounded-full bg-linear-to-r from-red-500 to-red-400 transition-all duration-700'
              style={{ width: `${problem.totalAttempts ? Math.round((problem.successfulSolves / problem.totalAttempts) * 100) : 0}%` }}
            />
          </div>
        </div>

        <div className='mt-4 border-t border-white/6 pt-4'>
          <div className='flex items-center justify-between'>
            {/* Left side actions: Like, Comment, Share */}
            <div className='flex items-center gap-5'>
              <button
                onClick={e => e.stopPropagation()}
                className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-red-400'
              >
                <Heart size={16} />
                <span>{problem.likesCount || 0}</span>
              </button>

              <button
                onClick={e => e.stopPropagation()}
                className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-sky-400'
              >
                <MessageCircle size={16} />
                <span>{problem.commentsCount || 0}</span>
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  setShareProblem(problem);
                }}
                className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition hover:text-green-400'
              >
                <Share2 size={16} />
                <span>{problem.sharesCount || 0}</span>
              </button>
            </div>

            {/* Right side actions: Bookmark */}
            <div className='flex items-center gap-2'>
              <button
                onClick={async e => {
                  e.stopPropagation();
                  await handleSaveToggle();
                }}
                disabled={saveLoading}
                className={`cursor-pointer transition-colors duration-150 disabled:opacity-50 ${saved ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div>
      {/* TABS */}
      <div className='flex border-y border-white/10'>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-2 py-4 text-sm font-medium transition-all hover:bg-white/5 ${
                isActive ? 'border-b-2 border-red-500 text-white' : 'border-b-2 border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className='h-4 w-4' />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className='flex flex-col space-y-4 pt-6 pb-2 px-2'>
        {!displayedProblems || displayedProblems.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <h3 className='text-lg font-semibold text-white'>No problems found</h3>
            <p className='mt-2 text-sm text-slate-500'>Problems will appear here.</p>
          </div>
        ) : (
          displayedProblems.map((problem, i) => <ProblemCardItem key={problem.id} problem={problem} index={i} />)
        )}
      </div>

      {/* Share Modal */}
      {shareProblem && (
        <ShareModal
          problem={{ id: shareProblem.id, title: shareProblem.title, slug: shareProblem.slug }}
          onClose={() => setShareProblem(null)}
          onShared={count => {
            updateProblemShares(shareProblem.id, count);
          }}
        />
      )}
    </div>
  );
};

export default MyPosts;
