import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/react';
import { Loader2 } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import useSocket from '../../hooks/useSocket';

import useUnreadMessagesCount from '../../hooks/useUnreadMessagesCount';

// ── date separator helper ─────────────────────────────────────
const dateLabel = iso => {
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

const DateSeparator = ({ label }) => (
  <div className='flex items-center gap-3 py-2'>
    <div className='flex-1 border-t border-white/6' />
    <span className='shrink-0 rounded-full border border-white/6 bg-[#0d0d0d] px-3 py-0.5 text-xs text-slate-600'>{label}</span>
    <div className='flex-1 border-t border-white/6' />
  </div>
);

// ── ChatWindow ────────────────────────────────────────────────
const ChatWindow = ({ conversation, currentUser, onBack }) => {
  const { getToken } = useAuth();
  const socket = useSocket();

  const { setCount: setUnreadCount } = useUnreadMessagesCount();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimer = useRef(null);
  const { id: conversationId, otherUser } = conversation;

  // ── fetch messages ────────────────────────────────────────
  const fetchMessages = useCallback(
    async (before = null, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      try {
        const token = await getToken();
        const url = `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}${before ? `?before=${before}` : ''}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setMessages(prev => (append ? [...data.messages, ...prev] : data.messages));
          setHasMore(data.hasMore);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [conversationId, getToken],
  );

  // ── join room + initial load ──────────────────────────────
  useEffect(() => {
    fetchMessages();

    socket.joinConversation(conversationId);

    // instantly clear this conversation's unread count locally
    if (conversation.unreadCount > 0) {
      setUnreadCount(prev => Math.max(0, prev - conversation.unreadCount));
    }

    socket.markSeen(conversationId);

    return () => socket.leaveConversation(conversationId);
  }, [conversationId]);

  // ── socket listeners ──────────────────────────────────────
  useEffect(() => {
    const onNewMessage = msg => {
      if (msg.conversationId !== conversationId) return;
      setMessages(prev => [...prev, msg]);
      socket.markSeen(conversationId); // mark seen when window is open
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const onSeen = ({ conversationId: cId }) => {
      if (cId !== conversationId) return;
      setMessages(prev => prev.map(m => (m.sender.id === currentUser?.id ? { ...m, status: 'SEEN' } : m)));
    };

    const onTypingStart = ({ clerkId }) => {
      if (clerkId === otherUser?.clerkId) {
        setIsTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const onTypingStop = ({ clerkId }) => {
      if (clerkId === otherUser?.clerkId) {
        clearTimeout(typingTimer.current);
        setIsTyping(false);
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('message:seen', onSeen);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('message:seen', onSeen);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [conversationId, currentUser?.id, otherUser?.clerkId, socket]);

  // ── scroll to bottom on first load ───────────────────────
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView();
    }
  }, [loading]);

  // ── load more on scroll to top ────────────────────────────
  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0 && hasMore && !loadingMore) {
      fetchMessages(messages[0]?.id, true);
    }
  };

  // ── group messages by date for separators ─────────────────
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg, i) => {
    const label = dateLabel(msg.createdAt);
    if (label !== lastDate) {
      grouped.push({ type: 'separator', label, key: `sep-${i}` });
      lastDate = label;
    }
    const prev = messages[i - 1];
    grouped.push({
      type: 'message',
      msg,
      isMine: msg.sender.id === currentUser?.id,
      showAvatar: !prev || prev.sender.id !== msg.sender.id,
      prevSameSender: !!prev && prev.sender.id === msg.sender.id,
    });
  });

  return (
    <div className='flex h-full flex-col'>
      <ChatHeader otherUser={otherUser} isTyping={isTyping} onBack={onBack} />

      {/* message list */}
      <div ref={containerRef} onScroll={handleScroll} className='flex-1 overflow-y-auto px-4 py-3 scrollbar-none'>
        {loadingMore && (
          <div className='flex justify-center py-2'>
            <Loader2 size={16} className='animate-spin text-slate-600' />
          </div>
        )}

        {loading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 size={22} className='animate-spin text-slate-600' />
          </div>
        ) : messages.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center gap-2 text-center'>
            <p className='text-4xl'>👋</p>
            <p className='text-sm font-medium text-slate-400'>Say hello to {otherUser?.displayName}</p>
            <p className='text-xs text-slate-600'>Messages are private between you two.</p>
          </div>
        ) : (
          grouped.map(item =>
            item.type === 'separator' ? (
              <DateSeparator key={item.key} label={item.label} />
            ) : (
              <MessageBubble
                key={item.msg.id}
                message={item.msg}
                isMine={item.isMine}
                showAvatar={item.showAvatar}
                prevSameSender={item.prevSameSender}
              />
            ),
          )
        )}

        {/* typing indicator bubble */}
        {isTyping && (
          <div className='mt-2 flex items-end gap-2'>
            <img src={otherUser?.avatarUrl} className='h-7 w-7 rounded-full border border-white/10 object-cover' />
            <div className='rounded-2xl rounded-bl-sm bg-[#1a1a1a] border border-white/6 px-4 py-3'>
              <div className='flex gap-1'>
                {[0, 1, 2].map(i => (
                  <span key={i} className='h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500' style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onTypingStart={() => socket.sendTypingStart(conversationId)}
        onTypingStop={() => socket.sendTypingStop(conversationId)}
      />
    </div>
  );
};

export default ChatWindow;
