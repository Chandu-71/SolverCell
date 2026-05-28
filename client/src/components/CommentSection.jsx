import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, Loader2, ChevronDown, AlertCircle } from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────
const timeAgo = iso => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const LIMIT = 5;
const MAX_LENGTH = 1000;

// ─── CommentSkeleton ──────────────────────────────────────────
const CommentSkeleton = () => (
  <div className='flex gap-3 animate-pulse'>
    <div className='h-8 w-8 rounded-full bg-white/5' />
    <div className='flex-1 space-y-2'>
      <div className='flex gap-2'>
        <div className='h-4 w-24 rounded bg-white/5' />
        <div className='h-4 w-16 rounded bg-white/5' />
      </div>
      <div className='space-y-1.5'>
        <div className='h-3.5 w-full rounded bg-white/5' />
        <div className='h-3.5 w-3/4 rounded bg-white/5' />
      </div>
    </div>
  </div>
);

// ─── CommentItem ──────────────────────────────────────────────
const CommentItem = ({ comment, currentUserId, onDelete, isDeleting }) => {
  const navigate = useNavigate();
  const isOwn = comment.user.id === currentUserId;

  return (
    <div className='group flex gap-3 py-1'>
      <img
        src={comment.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.username}`}
        alt={comment.user.displayName}
        onClick={() => navigate(`/profile/${comment.user.username}`)}
        className='h-8 w-8 shrink-0 cursor-pointer rounded-full border border-white/10 object-cover transition-transform hover:scale-105 mt-0.5'
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span
            onClick={() => navigate(`/profile/${comment.user.username}`)}
            className='cursor-pointer text-sm font-semibold text-white hover:text-red-400 transition-colors'
          >
            {comment.user.displayName}
          </span>
          <span className='text-xs text-slate-500'>@{comment.user.username}</span>
          <span className='text-[10px] text-slate-700'>•</span>
          <span className='text-xs text-slate-500'>{timeAgo(comment.createdAt)}</span>
        </div>
        <p className='mt-1 text-sm leading-relaxed text-slate-300 wrap-break-word whitespace-pre-wrap'>{comment.body}</p>
      </div>

      {isOwn && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          className='shrink-0 opacity-0 group-hover:opacity-100 rounded-lg px-3 text-slate-500 cursor-pointer transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50'
        >
          {isDeleting ? <Loader2 size={13} className='animate-spin' /> : <Trash2 size={13} />}
        </button>
      )}
    </div>
  );
};

// ─── EmptyState ───────────────────────────────────────────────
const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-8 text-center'>
    <div className='rounded-full bg-white/5 p-3 mb-3'>
      <svg
        width='20'
        height='20'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        className='text-slate-600'
      >
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
      </svg>
    </div>
    <p className='text-sm font-medium text-slate-400'>No comments yet</p>
    <p className='text-xs text-slate-600 mt-1'>Be the first to share your thoughts</p>
  </div>
);

// ─── ErrorState ───────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div className='flex flex-col items-center justify-center py-8 text-center'>
    <AlertCircle size={20} className='text-amber-500 mb-2' />
    <p className='text-sm text-slate-400'>Failed to load comments</p>
    <button onClick={onRetry} className='mt-2 text-xs text-red-400 hover:text-red-300 transition-colors'>
      Try again
    </button>
  </div>
);

// ─── CommentSection ───────────────────────────────────────────
const CommentSection = ({ problemId, currentUser, compact = false, onUpdateCount }) => {
  const { getToken } = useAuth();

  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // ── fetch page of comments ────────────────────────────────
  const fetchComments = async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}/comments?page=${pageNum}&limit=${LIMIT}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();

      if (data.success) {
        setComments(prev => (append ? [...prev, ...data.comments] : data.comments));
        setHasMore(data.hasMore);
        setTotalCount(data.total);
        setPage(pageNum);
        onUpdateCount?.(data.total);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
      if (!append) setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [problemId]);

  // ── auto-resize textarea ──────────────────────────────────
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [body]);

  // ── post ─────────────────────────────────────────────────
  const handlePost = async () => {
    if (!body.trim() || posting) return;

    setPosting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (!res.ok) throw new Error('Failed to post');
      const data = await res.json();

      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setTotalCount(prev => prev + 1);
        onUpdateCount?.(prev => prev + 1);
        setBody('');
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setPosting(false);
    }
  };

  // ── delete ────────────────────────────────────────────────
  const handleDelete = async commentId => {
    setDeletingId(commentId);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      const data = await res.json();

      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotalCount(prev => prev - 1);
        onUpdateCount?.(prev => prev - 1);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const characterCount = body.length;
  const isOverLimit = characterCount > MAX_LENGTH;
  const progressPercent = (characterCount / MAX_LENGTH) * 100;
  const showCountdown = characterCount > MAX_LENGTH * 0.85;

  return (
    <div className={`mt-3 space-y-4 ${compact ? '' : 'border-t border-white/6 pt-5'}`}>
      {/* compose box */}
      <div className='flex gap-3'>
        <img
          src={currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
          alt='Your avatar'
          className='h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover mt-0.5'
        />
        <div className='flex-1'>
          <div
            className={`
            relative rounded-xl border transition-all duration-200
            ${
              isFocused
                ? 'border-red-500/30 bg-[#1a1a1a] shadow-[0_0_0_1px_rgba(239,68,68,0.1)]'
                : 'border-white/[0.07] bg-[#141414] hover:border-white/10'
            }
          `}
          >
            <textarea
              ref={textareaRef}
              value={body}
              onChange={e => setBody(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder='Write a comment…'
              rows={compact ? 2 : 3}
              maxLength={MAX_LENGTH + 100} // Allow slight overtyping with visual feedback
              className='w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none'
            />

            {/* character count indicator */}
            {showCountdown && (
              <div className='absolute bottom-2 right-3 flex items-center gap-2'>
                <div className='h-1 w-16 rounded-full bg-white/5 overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      isOverLimit ? 'bg-red-500' : progressPercent > 90 ? 'bg-amber-500' : 'bg-red-500/40'
                    }`}
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
                <span className={`text-xs tabular-nums ${isOverLimit ? 'text-red-400' : 'text-slate-500'}`}>{MAX_LENGTH - characterCount}</span>
              </div>
            )}
          </div>

          {/* action bar */}
          <div className='flex items-center justify-between mt-2'>
            <span className='text-[11px] text-slate-600'>{isFocused ? 'Press Post to submit' : 'Share your thoughts'}</span>
            <button
              onClick={handlePost}
              disabled={!body.trim() || posting || isOverLimit}
              className='group relative inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-xs font-semibold text-red-400 cursor-pointer transition-all hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-500/10 disabled:hover:text-red-400 disabled:hover:border-red-500/20'
            >
              {posting ? (
                <>
                  <Loader2 size={12} className='animate-spin' />
                  Posting…
                </>
              ) : (
                <>
                  <Send size={12} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* comments list */}
      <div className='space-y-1'>
        {loading ? (
          <div className='space-y-4 py-2'>
            {[1, 2, 3].map(i => (
              <CommentSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={() => fetchComments(1)} />
        ) : comments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* comment count */}
            <div className='flex items-center gap-2 pb-2'>
              <span className='text-xs font-medium text-slate-500'>
                {totalCount} {totalCount === 1 ? 'comment' : 'comments'}
              </span>
              <div className='h-px flex-1 bg-white/4' />
            </div>

            <div className='space-y-3'>
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} currentUserId={currentUser?.id} onDelete={handleDelete} isDeleting={deletingId === c.id} />
              ))}
            </div>

            {/* load more */}
            {hasMore && (
              <button
                onClick={() => fetchComments(page + 1, true)}
                disabled={loadingMore}
                className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/6 py-2.5 text-sm text-slate-500 cursor-pointer transition-all hover:border-white/10 hover:text-slate-300 hover:bg-white/2 disabled:opacity-50'
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className='animate-spin' />
                    Loading…
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Show more comments
                  </>
                )}
              </button>
            )}

            {/* show less */}
            {comments.length > LIMIT && (
              <button
                onClick={() => fetchComments(1)}
                className='mt-1 w-full py-2 text-xs cursor-pointer text-slate-600 hover:text-slate-400 transition-colors'
              >
                Show less
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
