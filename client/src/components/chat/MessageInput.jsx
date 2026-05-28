import { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/react';

// ── MessageInput ──────────────────────────────────────────────
const MessageInput = ({ conversationId, onTypingStart, onTypingStop }) => {
  const { getToken } = useAuth();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  const handleChange = e => {
    setText(e.target.value);

    // typing indicator
    if (!isTyping.current) {
      isTyping.current = true;
      onTypingStart?.();
    }

    clearTimeout(typingTimer.current);

    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      onTypingStop?.();
    }, 1500);
  };

  const send = async () => {
    const message = text.trim();

    if (!message) return;
    if (sending) return;

    setSending(true);

    clearTimeout(typingTimer.current);
    isTyping.current = false;
    onTypingStop?.();

    try {
      const token = await getToken();

      await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          type: 'TEXT',
          body: message,
        }),
      });

      setText('');
    } catch (err) {
      console.error('send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className='shrink-0 bg-black px-4 py-3'>
      <div className='flex items-end gap-2'>
        {/* text input */}
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Message…'
          rows={1}
          className='max-h-32 flex-1 resize-none rounded-xl border border-white/8 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10'
          style={{ lineHeight: '1.5' }}
          onInput={e => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
          }}
        />

        {/* send button */}
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className='cursor-pointer rounded-xl bg-red-500 p-3 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40'
        >
          {sending ? <Loader2 size={18} className='animate-spin' /> : <Send size={18} />}
        </button>
      </div>

      <p className='mt-1.5 text-xs text-slate-700'>Enter to send · Shift+Enter for new line</p>
    </div>
  );
};

export default MessageInput;
