import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/react';
import { X, Search, Send, Link2, Check, Loader2, CheckCircle2 } from 'lucide-react';
import useCurrentUser from '../hooks/useCurrentUser';

// ─── helpers ─────────────────────────────────────────────────
const useDebounce = (value, delay) => {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
};

// ─── UserChip — avatar + name in horizontal row ──────────────
const UserChip = ({ user, selected, onClick }) => (
  <button onClick={onClick} className='flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group'>
    <div className='relative'>
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        className={`h-14 w-14 rounded-full border-2 object-cover transition-all ${
          selected ? 'border-red-500 opacity-80' : 'border-white/10 group-hover:border-white/30'
        }`}
      />
      {selected && (
        <span className='absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 ring-2 ring-[#111]'>
          <Check size={11} className='text-white' />
        </span>
      )}
    </div>
    <span className={`max-w-16 truncate text-center text-xs ${selected ? 'text-red-400' : 'text-slate-400'}`}>{user.displayName.split(' ')[0]}</span>
  </button>
);

// ─── UserRow — vertical search result ────────────────────────
const UserRow = ({ user, selected, onClick }) => (
  <button onClick={onClick} className='flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/4'>
    <div className='relative shrink-0'>
      <img
        src={user.avatarUrl}
        alt={user.displayName}
        className={`h-10 w-10 rounded-full border-2 object-cover transition ${selected ? 'border-red-500' : 'border-white/10'}`}
      />
      {user.isOnline && !selected && <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#111] bg-emerald-400' />}
    </div>
    <div className='min-w-0 flex-1 text-left'>
      <p className={`truncate text-sm font-medium ${selected ? 'text-red-400' : 'text-white'}`}>{user.displayName}</p>
      <p className='text-xs text-slate-600'>@{user.username}</p>
    </div>
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
        selected ? 'border-red-500 bg-red-500' : 'border-white/20'
      }`}
    >
      {selected && <Check size={11} className='text-white' />}
    </div>
  </button>
);

// ─── ShareModal ───────────────────────────────────────────────
const ShareModal = ({ problem, onClose, onShared }) => {
  const { getToken } = useAuth();
  const { user: currentUser } = useCurrentUser();

  // recent users from conversations
  const [recentUsers, setRecentUsers] = useState([]);
  // non-recent users added via search selection
  const [extraUsers, setExtraUsers] = useState([]);
  // set of selected user IDs
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [caption, setCaption] = useState('');

  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef(null);

  const problemUrl = `${window.location.origin}/workspace/${problem.id}`;

  // ── fetch recent conversations ────────────────────────────
  useEffect(() => {
    const run = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setRecentUsers(
            data.conversations
              .filter(c => c.otherUser)
              .slice(0, 12)
              .map(c => c.otherUser),
          );
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingRecent(false);
      }
    };
    run();
  }, [getToken]);

  // ── search — only fires when query is non-empty ───────────
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const run = async () => {
      setLoadingSearch(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}&type=users`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(
            data.users.filter(u => u.id !== currentUser?.id), // exclude self
          );
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingSearch(false);
      }
    };
    run();
  }, [debouncedQuery, currentUser?.id]);

  // ── horizontal display row = recents + extra selected ─────
  const displayRow = [...recentUsers, ...extraUsers];

  // ── toggle selection ──────────────────────────────────────
  const toggle = useCallback(
    user => {
      const alreadySelected = selectedIds.has(user.id);

      setSelectedIds(prev => {
        const next = new Set(prev);
        alreadySelected ? next.delete(user.id) : next.add(user.id);
        return next;
      });

      if (alreadySelected) {
        // if they were added as extra (from search), remove them from the row too
        setExtraUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        // if not in recents and not already in extras, add to row
        const inRecents = recentUsers.some(u => u.id === user.id);
        const inExtras = extraUsers.some(u => u.id === user.id);
        if (!inRecents && !inExtras) {
          setExtraUsers(prev => [...prev, user]);
        }
      }
    },
    [selectedIds, recentUsers, extraUsers],
  );

  const isSelected = id => selectedIds.has(id);
  const selectedCount = selectedIds.size;

  // ── send ──────────────────────────────────────────────────
  const handleSend = async () => {
    if (selectedCount === 0 || sending) return;
    setSending(true);
    try {
      const token = await getToken();

      // collect usernames from all selected users across both lists
      const allUsers = [...displayRow, ...searchResults];
      const usernames = [...new Set([...selectedIds].map(id => allUsers.find(u => u.id === id)?.username).filter(Boolean))];

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/share-post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          problemId: problem.id,
          targetUsernames: usernames,
          caption: caption.trim() || null,
        }),
      });

      const data = await res.json();
      const sharedCount = data.success ? data.results.filter(r => r.success).length : 0;
      if (sharedCount > 0 && typeof onShared === 'function') {
        onShared(sharedCount);
      }

      setSent(true);
      setTimeout(onClose, 1400);
    } catch (err) {
      console.error('share failed:', err);
    } finally {
      setSending(false);
    }
  };

  // ── copy link ─────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(problemUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showSearch = debouncedQuery.trim().length > 0;

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center'
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='relative w-full max-w-md overflow-hidden rounded-t-3xl border border-white/8 bg-[#111] shadow-2xl shadow-black/80 sm:rounded-3xl'>
        {/* ── HEADER ── */}
        <div className='flex items-center justify-between border-b border-white/6 px-5 py-4'>
          <div className='w-8' />
          <h2 className='text-base font-semibold text-white'>Share</h2>
          <button onClick={onClose} className='cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-white/6 hover:text-white'>
            <X size={18} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className='max-h-[65vh] overflow-y-auto scrollbar-none'>
          {/* HORIZONTAL ROW — always visible when there are recents or extra-selected */}
          {(loadingRecent || displayRow.length > 0) && (
            <div className='px-5 pt-4 pb-3'>
              {loadingRecent ? (
                <div className='flex gap-4 overflow-x-auto pb-1'>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className='flex shrink-0 flex-col items-center gap-1.5'>
                      <div className='h-14 w-14 animate-pulse rounded-full bg-white/6' />
                      <div className='h-2.5 w-10 animate-pulse rounded bg-white/6' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex gap-4 overflow-x-auto pb-1 scrollbar-none'>
                  {displayRow.map(user => (
                    <UserChip key={user.id} user={user} selected={isSelected(user.id)} onClick={() => toggle(user)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEARCH BAR */}
          <div className='px-5 py-3'>
            <div className='relative'>
              <Search size={15} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600' />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search people…'
                className='w-full rounded-xl border border-white/8 bg-[#1a1a1a] py-2.5 pl-9 pr-8 text-sm text-white placeholder-slate-600 outline-none transition focus:border-red-500/40'
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-600 hover:text-red-400 transition'
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* VERTICAL SECTION */}
          <div className='min-h-20 px-3 pb-3'>
            {/* no query state */}
            {!showSearch && <p className='py-6 text-center text-sm text-slate-600'>Search people to share with</p>}

            {/* loading */}
            {showSearch && loadingSearch && (
              <div className='flex justify-center py-6'>
                <Loader2 size={18} className='animate-spin text-slate-600' />
              </div>
            )}

            {/* no results */}
            {showSearch && !loadingSearch && searchResults.length === 0 && (
              <p className='py-6 text-center text-sm text-slate-600'>No users found for "{query}"</p>
            )}

            {/* results */}
            {showSearch &&
              !loadingSearch &&
              searchResults.map(user => <UserRow key={user.id} user={user} selected={isSelected(user.id)} onClick={() => toggle(user)} />)}
          </div>

          {/* CAPTION — only visible when someone is selected */}
          {selectedCount > 0 && (
            <div className='border-t border-white/6 px-5 py-3'>
              <textarea
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder='Add a message… (optional)'
                rows={2}
                maxLength={280}
                className='w-full resize-none rounded-xl border border-white/8 bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-red-500/40'
              />
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className='flex flex-col gap-2.5 border-t border-white/6 px-5 py-4'>
          <button
            onClick={handleSend}
            disabled={selectedCount === 0 || sending || sent}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {sent ? (
              <>
                <CheckCircle2 size={16} className='text-white' /> Sent!
              </>
            ) : sending ? (
              <>
                <Loader2 size={16} className='animate-spin' /> Sending…
              </>
            ) : selectedCount === 0 ? (
              'Select someone to send'
            ) : (
              <>
                <Send size={15} /> Send to {selectedCount} {selectedCount === 1 ? 'person' : 'people'}
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/8 py-2.5 text-sm text-slate-400 transition hover:border-white/20 hover:text-white'
          >
            {copied ? (
              <>
                <Check size={15} className='text-emerald-400' />
                <span className='text-emerald-400'>Link copied!</span>
              </>
            ) : (
              <>
                <Link2 size={15} />
                <span>Copy link to problem</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
