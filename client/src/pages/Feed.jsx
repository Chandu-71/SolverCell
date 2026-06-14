import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, Users, Loader2 } from 'lucide-react';

import { useAuth } from '@clerk/react';
import useCurrentUser from '../hooks/useCurrentUser';

import Footer from '../components/Footer';
import CommentSection from '../components/CommentSection';
import ShareModal from '../components/ShareModal';

// ─── helpers ────────────────────────────────────────────────
const timeAgo = iso => {
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

// ─── FeedSkeleton ────────────────────────────────────────────
const FeedSkeleton = () => {
  return (
    <div className='space-y-4'>
      {[1, 2, 3].map(i => (
        <div key={i} className='rounded-xl border border-white/8 bg-[#0d0d0d] p-5 animate-pulse' style={{ animationDelay: `${i * 100}ms` }}>
          {/* Header */}
          <div className='flex items-start justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='h-11 w-11 rounded-full bg-white/10' />
              <div className='space-y-2'>
                <div className='h-3 w-24 rounded bg-white/10' />
                <div className='h-3 w-16 rounded bg-white/10' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-5 w-16 rounded-full bg-white/10' />
              <div className='h-5 w-20 rounded-full bg-white/10' />
            </div>
          </div>

          {/* Title & Summary */}
          <div className='mt-4 space-y-3'>
            <div className='h-5 w-3/4 rounded bg-white/10' />
            <div className='space-y-2'>
              <div className='h-3 w-full rounded bg-white/10' />
              <div className='h-3 w-5/6 rounded bg-white/10' />
            </div>
          </div>

          {/* Tags */}
          <div className='mt-4 flex flex-wrap gap-1.5'>
            {[1, 2, 3].map(tag => (
              <div key={tag} className='h-5 w-16 rounded-md bg-white/10' />
            ))}
          </div>

          {/* Stats Bar */}
          <div className='mt-4 space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='h-3 w-32 rounded bg-white/10' />
              <div className='h-3 w-24 rounded bg-white/10' />
            </div>
            <div className='h-1 w-full rounded-full bg-white/10' />
          </div>

          {/* Action Buttons */}
          <div className='mt-4 border-t border-white/8 pt-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-5'>
                {[1, 2, 3].map(btn => (
                  <div key={btn} className='flex items-center gap-1.5'>
                    <div className='h-4 w-4 rounded bg-white/10' />
                    <div className='h-3 w-8 rounded bg-white/10' />
                  </div>
                ))}
              </div>
              <div className='h-4 w-4 rounded bg-white/10' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── ProblemCard ─────────────────────────────────────────────
const ProblemCard = ({ problem, index, getToken, solvedProblems = [], attemptedProblems = [] }) => {
  if (!problem) return null;

  const { user: dbUser } = useCurrentUser();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(problem.likesCount || 0);
  const [sharesCount, setSharesCount] = useState(problem.sharesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(problem.commentsCount || 0);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);

  const author = problem.author || {};

  const isSolved = solvedProblems.some(p => p.id === problem.id);
  const isAttempted = attemptedProblems.some(p => p.id === problem.id);

  const diff = DIFFICULTY_CONFIG[problem.difficulty] || DIFFICULTY_CONFIG.Medium;
  const solveRate = problem.totalAttempts > 0 ? Math.round((problem.successfulSolves / problem.totalAttempts) * 100) : 0;

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/like-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setLiked(data.liked);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchLikeStatus();
  }, [problem.id, getToken]);

  const handleLike = async () => {
    try {
      setLikeLoading(true);
      const token = await getToken();
      const method = liked ? 'DELETE' : 'POST';

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setLiked(data.liked);
        setLikeCount(data.likesCount);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    const fetchSaveStatus = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/save-status`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const token = await getToken();
      const method = saved ? 'DELETE' : 'POST';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/save`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.saved);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <article
      className='rounded-xl border border-white/8 bg-[#0d0d0d] p-5 transition-all duration-300 hover:border-red-500/25 hover:bg-[#111]'
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className='flex items-start justify-between gap-3'>
        {/* Clickable group for Author Avatar + Name */}
        <div
          onClick={() => author.username && navigate(`/profile/${author.username}`)}
          className='flex items-center gap-3 cursor-pointer group/author'
        >
          <div className='relative'>
            <img
              src={author.avatarUrl}
              alt={author.displayName}
              className='h-11 w-11 rounded-full object-cover ring-2 ring-white/10 transition-all duration-200 group-hover/author:opacity-80 group-hover/author:ring-red-500'
            />
          </div>

          <div>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-white transition-colors duration-200 group-hover/author:text-red-400'>
                {author.displayName}
              </span>
              <span className='text-xs text-slate-500'>@{author.username}</span>
            </div>
            <span className='text-xs text-slate-600'>{timeAgo(problem.createdAt)}</span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isSolved && <span className='inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-400'>Solved</span>}

          {isAttempted && !isSolved && (
            <span className='inline-flex rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-semibold text-yellow-400'>Attempted</span>
          )}

          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${diff.bg} ${diff.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
            {problem.difficulty}
          </span>
        </div>
      </div>

      {/* Clickable group for Problem Title */}
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
          <span>{solveRate}% acceptance rate</span>
        </div>

        <div className='h-1 w-full overflow-hidden rounded-full bg-white/6'>
          <div
            className='h-full rounded-full bg-linear-to-r from-red-500 to-red-400 transition-all duration-700'
            style={{ width: `${solveRate}%` }}
          />
        </div>
      </div>

      <div className='mt-4 border-t border-white/6 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-5'>
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 disabled:opacity-50 ${
                liked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex cursor-pointer items-center gap-1.5 text-sm transition-colors duration-150 ${
                showComments ? 'text-sky-400' : 'text-slate-500 hover:text-sky-400'
              }`}
            >
              <MessageCircle size={16} fill={showComments ? 'currentColor' : 'none'} />
              <span>{commentCount}</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className='flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition hover:text-green-400'
            >
              <Share2 size={16} />
              <span>{sharesCount}</span>
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className={`cursor-pointer transition-colors duration-150 disabled:opacity-50 ${saved ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
            >
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {showComments && <CommentSection problemId={problem.id} currentUser={dbUser} onUpdateCount={setCommentCount} />}
      </div>

      {shareOpen && (
        <ShareModal
          problem={{ id: problem.id, title: problem.title, slug: problem.slug }}
          onClose={() => setShareOpen(false)}
          onShared={count => setSharesCount(prev => prev + count)}
        />
      )}
    </article>
  );
};

// ─── Feed ────────────────────────────────────────────────────
const Feed = () => {
  const { getToken } = useAuth();
  const { user: dbUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('forYou');

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreRef = useRef(null);

  // Fetch user solved/attempted status once
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!dbUser?.username) return;
      try {
        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${dbUser.username}/problems`, {
          cache: 'no-store',
        });
        const userData = await userRes.json();
        if (userData.success) {
          setSolvedProblems(userData.solved || []);
          setAttemptedProblems(userData.attempted || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserStatus();
  }, [dbUser?.username]);

  // Fetch problems with cursor-based pagination
  const fetchProblems = useCallback(
    async (cursorValue = null, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const token = await getToken();
        const params = new URLSearchParams();
        if (cursorValue) params.set('cursor', cursorValue);

        const feedRes = await fetch(`${import.meta.env.VITE_API_URL}/api/problems?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const feedData = await feedRes.json();

        if (feedData.success) {
          setProblems(prev => (append ? [...prev, ...feedData.problems] : feedData.problems));
          setCursor(feedData.nextCursor);
          setHasMore(feedData.hasMore);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [getToken],
  );

  // Initial load
  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchProblems(cursor, true);
        }
      },
      { threshold: 0.1 },
    );

    const sentinel = loadMoreRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, cursor, fetchProblems]);

  const filteredProblems = activeTab === 'following' ? problems.filter(problem => problem.author?.isFollowing) : problems;

  const tabs = [
    { id: 'forYou', label: 'For You' },
    { id: 'following', label: 'Following' },
  ];

  return (
    <div className='flex min-h-full flex-col justify-between space-y-4'>
      <div className='space-y-4 flex-1'>
        {/* Tabs */}
        <div className='sticky top-0 z-20 flex items-center justify-around rounded-2xl border border-white/8 bg-[#090909]/90 p-2 backdrop-blur-xl'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer mx-2 w-full rounded-xl py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <FeedSkeleton />
        ) : filteredProblems.length === 0 ? (
          <div className='rounded-2xl border border-white/8 bg-black p-12 text-center'>
            <p className='text-sm text-slate-500'>No problems here yet.</p>
          </div>
        ) : (
          <>
            {filteredProblems.map((problem, i) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                index={i}
                getToken={getToken}
                solvedProblems={solvedProblems}
                attemptedProblems={attemptedProblems}
              />
            ))}

            {/* Sentinel element for IntersectionObserver */}
            <div ref={loadMoreRef} className='h-4' />

            {/* Loading more indicator */}
            {loadingMore && (
              <div className='flex items-center justify-center py-6'>
                <Loader2 size={24} className='animate-spin text-red-500' />
              </div>
            )}

            {/* End of feed indicator */}
            {!hasMore && filteredProblems.length > 0 && (
              <div className='py-6 text-center'>
                <p className='text-xs text-slate-600'>You've reached the end</p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Feed;
