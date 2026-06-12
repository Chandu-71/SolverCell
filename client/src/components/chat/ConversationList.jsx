import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ conversations, activeId, onSelect }) => {
  if (conversations.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
        <div className='mb-3 text-4xl'>💬</div>
        <p className='text-sm font-medium text-slate-400'>No conversations yet</p>
        <p className='mt-1 text-xs text-slate-600'>Search for a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className='space-y-0.5 px-2'>
      {conversations.map(conv => {
        const other = conv.otherUser;
        const isActive = conv.id === activeId;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left cursor-pointer transition-all ${
              isActive ? 'bg-red-500/10 border border-red-500/20' : 'border border-transparent hover:bg-white/4'
            }`}
          >
            {/* avatar + online dot */}
            <div className='relative shrink-0'>
              <img src={other?.avatarUrl} alt={other?.displayName} className='h-11 w-11 rounded-full border border-white/10 object-cover' />
              {other?.isOnline && <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d0d0d] bg-emerald-400' />}
            </div>

            {/* name + preview */}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between'>
                <span className={`truncate text-sm font-semibold ${isActive ? 'text-red-300' : 'text-white'}`}>{other?.displayName}</span>
                {conv.lastMessageAt && (
                  <span className='shrink-0 text-xs text-slate-600'>{formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}</span>
                )}
              </div>
              <div className='flex items-center justify-between gap-2'>
                <p className='truncate text-xs text-slate-500'>{conv.lastMessagePreview || 'Start a conversation'}</p>
                {conv.unreadCount > 0 && (
                  <span className='shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white'>
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
