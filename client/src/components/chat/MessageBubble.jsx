import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import SharedPostCard from './SharedPostCard';

const StatusIcon = ({ status }) => {
  if (status === 'SEEN') return <CheckCheck size={13} className='text-sky-400' />;
  if (status === 'DELIVERED') return <CheckCheck size={13} className='text-slate-500' />;
  return <Check size={13} className='text-slate-600' />;
};

const MessageBubble = ({ message, isMine, showAvatar, prevSameSender }) => {
  const gap = prevSameSender ? 'mt-0.5' : 'mt-3';
  const isPost = message.type === 'SHARED_POST' && message.problem;
  const hasCaption = isPost && message.body;

  return (
    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${gap}`}>
      {/* avatar — once per sender group */}
      <div className='w-7 shrink-0'>
        {showAvatar && !isMine && (
          <img src={message.sender.avatarUrl} alt={message.sender.displayName} className='h-7 w-7 rounded-full border border-white/10 object-cover' />
        )}
      </div>

      {/* bubble */}
      <div className={`flex max-w-[72%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* ── SHARED POST — card-first layout ── */}
        {isPost ? (
          <div className={`overflow-hidden rounded-2xl ${isMine ? 'rounded-br-sm bg-red-700' : 'rounded-bl-sm border border-white/6 bg-[#1a1a1a]'}`}>
            {/* shared card */}
            <div className='p-2.5 pb-0'>
              <SharedPostCard problem={message.problem} isMine={isMine} />
            </div>

            {/* caption — below the card */}
            {hasCaption && (
              <p
                className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                  isMine ? 'border-white/15 text-white' : 'border-white/6 text-slate-300'
                }`}
              >
                {message.body}
              </p>
            )}

            {/* padding if no caption */}
            {!hasCaption && <div className='pb-2' />}
          </div>
        ) : (
          /* ── PLAIN TEXT ── */
          <div
            className={`rounded-2xl px-3.5 py-2.5 ${
              isMine ? 'rounded-br-sm bg-red-700 text-white' : 'rounded-bl-sm bg-[#1a1a1a] text-slate-200 border border-white/6'
            }`}
          >
            <p className='text-sm leading-relaxed whitespace-pre-wrap wrap-break-word'>{message.body}</p>
          </div>
        )}

        {/* timestamp + status */}
        <div className={`mt-0.5 flex items-center gap-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className='text-xs text-slate-700'>{format(new Date(message.createdAt), 'HH:mm')}</span>
          {isMine && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
