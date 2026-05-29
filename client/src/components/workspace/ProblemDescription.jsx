import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { useAuth } from '@clerk/react';
import useCurrentUser from '../../hooks/useCurrentUser';
import CommentSection from '../CommentSection';
import ShareModal from '../ShareModal';

import { Heart, CheckCircle2, CircleDot, MessageCircle, Share2 } from 'lucide-react';

const difficultyStyles = {
  Easy: 'bg-green-500/10 text-green-400',
  Medium: 'bg-yellow-500/10 text-yellow-400',
  Hard: 'bg-red-500/10 text-red-400',
};

const ProblemDescription = ({ problem }) => {
  const { getToken } = useAuth();
  const { user: dbUser } = useCurrentUser();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(problem.likesCount);
  const [sharesCount, setSharesCount] = useState(problem.sharesCount || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(problem.commentsCount || 0);

  // Share state
  const [shareOpen, setShareOpen] = useState(false);

  const [solvedProblems, setSolvedProblems] = useState([]);
  const [attemptedProblems, setAttemptedProblems] = useState([]);

  const acceptanceRate = problem.totalAttempts > 0 ? Math.round((problem.successfulSolves / problem.totalAttempts) * 100) : 0;

  // Fetch user's problems to determine status
  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!dbUser?.username) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${dbUser.username}/problems`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success) {
          setSolvedProblems(data.solved || []);
          setAttemptedProblems(data.attempted || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserStatus();
  }, [dbUser?.username]);

  // Check if this problem's ID is in the arrays we just fetched
  const isSolved = solvedProblems.some(p => p.id === problem.id);
  const isAttempted = attemptedProblems.some(p => p.id === problem.id);

  const handleLike = async () => {
    try {
      setLikeLoading(true);
      const token = await getToken();
      const method = liked ? 'DELETE' : 'POST';

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    const fetchLikeStatus = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problem.id}/like-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [problem.id]);

  return (
    <>
      <div className='h-full flex flex-col overflow-y-auto scrollbar-none'>
        {/* HEADER */}
        <div className='p-6'>
          <div className='flex items-center justify-between gap-6'>
            {/* TITLE */}
            <h1 className='text-3xl font-bold tracking-tight text-white flex-1'>{problem.title}</h1>

            {/* STATUS & DIFFICULTY */}
            <div className='flex items-center gap-3 shrink-0'>
              {isSolved && <span className='inline-flex rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-400'>Solved</span>}

              {isAttempted && !isSolved && (
                <span className='inline-flex rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-400'>Attempted</span>
              )}

              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${difficultyStyles[problem.difficulty]}`}>{problem.difficulty}</span>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className='px-6 pb-6 flex-1'>
          <div
            className='prose prose-invert max-w-none
              prose-headings:text-white
              prose-p:text-slate-300
              prose-strong:text-white
              prose-li:text-slate-300
              prose-code:text-red-300
              prose-code:before:hidden
              prose-code:after:hidden
              prose-pre:border
              prose-pre:border-white/6
              prose-pre:bg-[#111111]
              prose-pre:text-slate-200
              prose-blockquote:border-red-500/20
              prose-blockquote:text-slate-400'
          >
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{problem.description}</ReactMarkdown>
          </div>
        </div>

        {problem.constraints && (
          <div className='px-6 pb-6'>
            <h2 className='mb-3 text-lg font-semibold text-white'>Constraints</h2>

            <pre className='overflow-x-auto rounded-xl border border-white/8 bg-[#111] p-4 text-sm text-slate-300'>{problem.constraints}</pre>
          </div>
        )}

        {/* FOOTER: TAGS, METRICS & ACTIONS */}
        <div className='border-t border-white/6 p-6 mt-auto bg-[#0a0a0a]'>
          {/* PROBLEM TAGS */}
          <div className='mb-6 flex flex-wrap gap-2'>
            {problem.tags.map(tag => (
              <span
                key={tag}
                className='rounded-md border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs text-slate-400 hover:border-red-500/30 hover:text-red-300 transition-colors'
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* METRICS ROW */}
          <div className='flex flex-wrap items-center gap-6'>
            {/* LIKES */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50 transition-colors ${
                liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <Heart className='h-4 w-4' fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>

            {/* COMMENTS TOGGLE */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 text-sm cursor-pointer transition-colors ${
                showComments ? 'text-sky-400' : 'text-slate-400 hover:text-sky-400'
              }`}
            >
              <MessageCircle className='h-4 w-4' fill={showComments ? 'currentColor' : 'none'} />
              <span>{commentCount} comments</span>
            </button>

            {/* SHARE BUTTON */}
            <button
              onClick={() => setShareOpen(true)}
              className='flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-green-400 transition'
            >
              <Share2 className='h-4 w-4' />
              <span>{sharesCount}</span>
            </button>

            {/* ACCEPTED COUNT */}
            <div className='flex items-center gap-2 text-sm text-slate-400'>
              <CheckCircle2 className='h-4 w-4 text-green-400' />
              <span>
                {problem.successfulSolves}/{problem.totalAttempts} Accepted
              </span>
            </div>

            {/* ACCEPTANCE RATE */}
            <div className='flex items-center gap-2 text-sm text-slate-400'>
              <CircleDot className='h-4 w-4 text-red-400' />
              <span>{acceptanceRate}% Acceptance Rate</span>
            </div>
          </div>

          {/* DECOUPLED COMMENT SECTION */}
          {showComments && (
            <div className='mt-6'>
              <CommentSection problemId={problem.id} currentUser={dbUser} compact={false} onUpdateCount={setCommentCount} />
            </div>
          )}
        </div>
      </div>

      {/* SHARE MODAL RENDERED OUTSIDE SCROLLABLE CONTAINER */}
      {shareOpen && (
        <ShareModal
          problem={{ id: problem.id, title: problem.title, slug: problem.slug }}
          onClose={() => setShareOpen(false)}
          onShared={count => setSharesCount(prev => prev + count)}
        />
      )}
    </>
  );
};

export default ProblemDescription;
