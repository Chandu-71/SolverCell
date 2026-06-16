import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Bell, Loader2, Heart, MessageCircle, UserPlus, Check } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

import LeftSidebar from '../components/LeftSidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';
import useSocket from '../hooks/useSocket';
import useNotificationCount from '../hooks/useNotificationCount';

const groupNotifications = notifications => {
  const groups = {
    new: [],
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);

    // unread notifications
    if (!notification.read) {
      groups.new.push(notification);
      return;
    }

    if (isToday(date)) {
      groups.today.push(notification);
    } else if (isYesterday(date)) {
      groups.yesterday.push(notification);
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
};

// Corner badge mapping helper
const getNotificationBadge = type => {
  const baseClass = 'absolute -bottom-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full ring-2 ring-[#0f0f0f]';

  switch (type) {
    case 'PROBLEM_LIKED':
      return (
        <div className={`${baseClass} bg-red-500`}>
          <Heart size={10} className='text-white' fill='currentColor' />
        </div>
      );
    case 'PROBLEM_COMMENTED':
      return (
        <div className={`${baseClass} bg-emerald-500`}>
          <MessageCircle size={10} className='text-white' fill='currentColor' />
        </div>
      );
    case 'NEW_FOLLOWER':
      return (
        <div className={`${baseClass} bg-blue-500`}>
          <UserPlus size={10} className='text-white' />
        </div>
      );
    case 'PROBLEM_SOLVED':
      return (
        <div className={`${baseClass} bg-amber-500`}>
          <Check size={11} className='text-white' strokeWidth={3} />
        </div>
      );
    default:
      return (
        <div className={`${baseClass} bg-slate-600`}>
          <Bell size={10} className='text-white' />
        </div>
      );
  }
};

const Notifications = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const socket = useSocket();
  const { setCount } = useNotificationCount();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken();

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [getToken]);

  // realtime notifications
  useEffect(() => {
    const onNewNotification = notification => {
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('notification:new', onNewNotification);

    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    setCount(0);
  }, [notifications.length, setCount]);

  // mark read on open
  useEffect(() => {
    const markRead = async () => {
      try {
        const token = await getToken();

        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCount(0);
      } catch (err) {
        console.error(err);
      }
    };

    markRead();
  }, [getToken, setCount]);

  const handleClick = notification => {
    const payload = notification.payload;

    if (notification.type === 'NEW_FOLLOWER') {
      if (payload.actor?.username) {
        navigate(`/profile/${payload.actor.username}`);
      }
      return;
    }

    if (payload.problemId) {
      navigate(`/problem/${payload.problemId}`);
    }
  };

  const groupedNotifications = groupNotifications(notifications);

  const sections = [
    { key: 'new', label: 'New' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'older', label: 'Older' },
  ];

  return (
    <div className='flex h-screen bg-black text-white'>
      <aside className='hidden lg:flex shrink-0'>
        <LeftSidebar />
      </aside>

      <div className='min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0'>
        <main className='mx-auto min-h-full flex-1 px-3 py-4 sm:px-5 sm:py-6'>
          <div className='mx-auto max-w-2xl'>
            {/* header */}
            <div className='mb-4 sm:mb-6 flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/40'>
                <Bell size={22} className='text-slate-100' />
              </div>

              <div>
                <h1 className='text-xl sm:text-2xl font-bold text-white'>Notifications</h1>
                <p className='text-xs sm:text-sm text-slate-500'>Your recent activity and interactions</p>
              </div>
            </div>

            {/* content */}
            {loading ? (
              <div className='flex justify-center py-20'>
                <Loader2 size={24} className='animate-spin text-slate-600' />
              </div>
            ) : notifications.length === 0 ? (
              <div className='rounded-3xl border border-white/8 bg-[#0f0f0f] py-20 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/4'>
                  <Bell size={28} className='text-slate-600' />
                </div>

                <h2 className='text-lg font-semibold text-slate-300'>No notifications yet</h2>

                <p className='mt-1 text-sm text-slate-600'>Community activity on your problems and profile will appear here.</p>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                {sections.map(section => {
                  const items = groupedNotifications[section.key];

                  if (!items.length) return null;

                  return (
                    <div key={section.key}>
                      {/* section heading */}
                      <div className='mb-3 flex items-center gap-3'>
                        <div className='h-px flex-1 bg-white/6' />
                        <h2 className='shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-500'>{section.label}</h2>
                        <div className='h-px flex-1 bg-white/6' />
                      </div>

                      {/* notifications */}
                      <div className='space-y-3'>
                        {items.map(notification => {
                          const payload = notification.payload;
                          const actor = payload.actor;

                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleClick(notification)}
                              className='flex w-full cursor-pointer items-start sm:items-center gap-3 sm:gap-4 rounded-2xl border border-white/6 bg-[#0f0f0f] p-3 sm:p-4 text-left transition hover:border-white/10 hover:bg-[#151515]'
                            >
                              {/* actor avatar wrapper */}
                              <div className='relative shrink-0'>
                                {actor?.avatarUrl ? (
                                  <img
                                    onClick={e => {
                                      e.stopPropagation();
                                      navigate(`/profile/${actor.username}`);
                                    }}
                                    src={actor.avatarUrl}
                                    alt={actor.username}
                                    className='h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-white/10 object-cover transition hover:border-red-500 hover:opacity-80'
                                  />
                                ) : (
                                  <div
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (actor?.username) navigate(`/profile/${actor.username}`);
                                    }}
                                    className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base sm:text-lg font-semibold text-slate-400 transition hover:border-red-500 hover:opacity-80 uppercase'
                                  >
                                    {actor?.username?.[0] || '?'}
                                  </div>
                                )}
                                {/* Dynamic Overlay Icon */}
                                {getNotificationBadge(notification.type)}
                              </div>

                              {/* body */}
                              <div className='min-w-0 flex-1'>
                                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3'>
                                  <div className='min-w-0 flex-1'>
                                    {/* text */}
                                    <p className='text-sm leading-relaxed text-slate-300'>
                                      <span className='font-semibold text-white'>{actor?.username ? `@${actor.username}` : 'Deleted user'}</span>{' '}
                                      {notification.type === 'NEW_FOLLOWER' && <>started following you</>}
                                      {notification.type === 'PROBLEM_LIKED' && <>liked your problem</>}
                                      {notification.type === 'PROBLEM_COMMENTED' && (
                                        <>
                                          commented: <span className='text-slate-400'>{payload.commentBody}</span>
                                        </>
                                      )}
                                      {notification.type === 'PROBLEM_SOLVED' && <>solved your problem</>}
                                    </p>

                                    {/* problem title */}
                                    {payload.problemTitle && <p className='mt-1 text-sm font-medium text-red-400'>{payload.problemTitle}</p>}
                                    {notification.type === 'PROBLEM_SOLVED' && (
                                      <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
                                        <span className='rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-400'>
                                          {payload.runtime}s
                                        </span>

                                        <span className='rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-sky-400'>
                                          {payload.memory} KB
                                        </span>

                                        <span className='rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-slate-300 uppercase'>
                                          {payload.language}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* time */}
                                  <span className='shrink-0 sm:pt-0.5 text-xs text-slate-600'>
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Notifications;
