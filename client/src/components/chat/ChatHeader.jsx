import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ChatHeader = ({ otherUser, isTyping, onBack }) => {
  const navigate = useNavigate();

  return (
    <div className='flex shrink-0 items-center gap-3 border-b border-white/6 bg-black px-4 py-3'>
      {/* back button (mobile) */}
      <button onClick={onBack} className='mr-1 cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-white/6 hover:text-white lg:hidden'>
        <ArrowLeft size={18} />
      </button>

      <div onClick={() => navigate(`/profile/${otherUser?.username}`)} className='group flex flex-1 cursor-pointer items-center gap-3'>
        {/* avatar */}
        <div className='relative'>
          <img
            src={otherUser?.avatarUrl}
            alt={otherUser?.displayName}
            className='h-9 w-9 rounded-full border border-white/10 object-cover transition-colors group-hover:border-red-400 group-hover:border-2'
          />
          {otherUser?.isOnline && <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] bg-emerald-400' />}
        </div>

        {/* name + status */}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold text-white transition-colors group-hover:text-red-400'>{otherUser?.displayName}</p>
          <p className='text-xs text-slate-500'>
            {isTyping ? <span className='animate-pulse text-emerald-400'>typing…</span> : otherUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
