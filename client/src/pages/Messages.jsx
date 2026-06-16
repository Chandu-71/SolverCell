import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Search, X, Loader2, MessageSquare, UserX } from 'lucide-react';

import LeftSidebar from '../components/LeftSidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';

import useCurrentUser from '../hooks/useCurrentUser';
import useSocket from '../hooks/useSocket';

// ── UserSearchBox ─────────────────────────────────────────────
const UserSearchBox = ({ onStartConversation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async q => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(q)}&type=users`);
      const data = await res.json();

      if (data.success) {
        setResults(data.users.slice(0, 6));
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const showDropdown = query.trim() && (loading || results.length > 0 || searched);

  return (
    <div className='px-3 py-3'>
      <div className='relative'>
        <Search size={16} className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600' />

        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            search(e.target.value);
          }}
          placeholder='Search people…'
          className='w-full rounded-xl border border-white/8 bg-[#141414] py-2 pl-10 pr-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-red-500/40'
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setSearched(false);
            }}
            className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-600 hover:text-red-400'
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* results dropdown */}
      {showDropdown && (
        <div className='mt-1.5 overflow-hidden rounded-xl border border-white/8 bg-[#111]'>
          {loading && (
            <div className='flex justify-center py-4'>
              <Loader2 size={16} className='animate-spin text-red-400' />
            </div>
          )}

          {/* users */}
          {!loading &&
            results.length > 0 &&
            results.map(u => (
              <button
                key={u.id}
                onClick={() => {
                  onStartConversation(u.username);
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className='flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/5'
              >
                <div className='relative shrink-0'>
                  <img src={u.avatarUrl} className='h-8 w-8 rounded-full border border-white/10 object-cover' />
                  {u.isOnline && <span className='absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#111] bg-emerald-400' />}
                </div>

                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-white'>{u.displayName}</p>
                  <p className='text-xs text-slate-600'>@{u.username}</p>
                </div>
              </button>
            ))}

          {/* no users found */}
          {!loading && searched && results.length === 0 && (
            <div className='flex flex-col items-center justify-center gap-2 px-4 py-5 text-center'>
              <UserX size={18} className='text-slate-600' />
              <p className='text-sm font-medium text-slate-400'>No users found</p>
              <p className='text-xs text-slate-600'>Try another username or name</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Messages page ─────────────────────────────────────────────
const Messages = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [convsLoading, setConvsLoading] = useState(true);

  // ── fetch conversations ──────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConvsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── socket listeners ─────────────────────────────────────
  useEffect(() => {
    const onUpdated = ({ conversationId, lastMessagePreview, lastMessageAt }) => {
      setConversations(prev =>
        prev
          .map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessagePreview,
                  lastMessageAt,
                  unreadCount: c.id === activeConv?.id ? 0 : c.unreadCount + 1,
                }
              : c,
          )
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)),
      );
    };

    const onUserOnline = ({ clerkId }) =>
      setConversations(prev => prev.map(c => (c.otherUser?.clerkId === clerkId ? { ...c, otherUser: { ...c.otherUser, isOnline: true } } : c)));

    const onUserOffline = ({ clerkId }) =>
      setConversations(prev => prev.map(c => (c.otherUser?.clerkId === clerkId ? { ...c, otherUser: { ...c.otherUser, isOnline: false } } : c)));

    socket.on('conversation:updated', onUpdated);
    socket.on('user:online', onUserOnline);
    socket.on('user:offline', onUserOffline);

    return () => {
      socket.off('conversation:updated', onUpdated);
      socket.off('user:online', onUserOnline);
      socket.off('user:offline', onUserOffline);
    };
  }, [activeConv?.id, socket]);

  // ── set active conversation from URL ─────────────────────
  useEffect(() => {
    if (!paramId || conversations.length === 0) return;

    const found = conversations.find(c => c.id === paramId);

    if (found) {
      setActiveConv(found);
    } else {
      navigate('/messages', { replace: true });
    }
  }, [paramId, conversations, navigate]);

  // ── start conversation ───────────────────────────────────
  const handleStartConversation = async username => {
    try {
      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUsername: username }),
      });

      const data = await res.json();

      if (data.success) {
        const conv = data.conversation;

        if (data.created) {
          setConversations(prev => [
            {
              ...conv,
              unreadCount: 0,
              lastMessagePreview: null,
              lastMessageAt: null,
            },
            ...prev,
          ]);
        }

        setActiveConv(conv);
        navigate(`/messages/${conv.id}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConv = conv => {
    setConversations(prev => prev.map(c => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)));

    setActiveConv(conv);
    navigate(`/messages/${conv.id}`, { replace: true });
  };

  const handleBack = () => {
    setActiveConv(null);
    navigate('/messages', { replace: true });
  };

  return (
    <div className='flex h-screen overflow-hidden bg-black text-white'>
      <div className='hidden lg:flex'>
        <LeftSidebar collapsed={true} />
      </div>

      {/* CHAT SIDEBAR */}
      <div
        className={`lg:ml-20 flex h-full w-full shrink-0 flex-col border-r border-white/6 lg:w-80 xl:w-96 pb-14 lg:pb-0 ${
          activeConv ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className='flex shrink-0 items-center justify-between border-b border-white/6 px-4 py-4.5'>
          <h2 className='text-base font-bold text-white'>Messages</h2>
          <MessageSquare size={18} className='text-slate-600' />
        </div>

        <UserSearchBox onStartConversation={handleStartConversation} />

        <div className='flex-1 overflow-y-auto scrollbar-none pb-4'>
          {userLoading || convsLoading ? (
            <div className='flex h-full items-center justify-center'>
              <Loader2 size={22} className='animate-spin text-red-400' />
            </div>
          ) : (
            <ConversationList conversations={conversations} activeId={activeConv?.id} onSelect={handleSelectConv} />
          )}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className={`flex h-full min-w-0 flex-1 flex-col ${activeConv ? 'flex' : 'hidden lg:flex'}`}>
        {userLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 size={24} className='animate-spin text-red-400' />
          </div>
        ) : activeConv ? (
          <ChatWindow key={activeConv.id} conversation={activeConv} currentUser={currentUser} onBack={handleBack} />
        ) : (
          <div className='flex h-full flex-col items-center justify-center gap-3 text-center'>
            <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white/4'>
              <MessageSquare size={28} className='text-slate-600' />
            </div>
            <p className='text-base font-semibold text-slate-400'>Your messages</p>
            <p className='text-sm text-slate-600'>Select a conversation or search for someone to start chatting.</p>
          </div>
        )}
      </div>

      {/* HIDE BOTTOM NAV IF ACTIVELY IN A CHAT */}
      {!activeConv && <MobileBottomNav />}
    </div>
  );
};

export default Messages;
