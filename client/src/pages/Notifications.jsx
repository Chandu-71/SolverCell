import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Heart, MessageCircle, UserPlus, Bell, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';

import LeftSidebar from '../components/LeftSidebar';
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
  }, []);

  useEffect(() => {
    setCount(0);
  }, [notifications.length]);

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
  }, []);

  const handleClick = notification => {
    const payload = notification.payload;

    if (notification.type === 'NEW_FOLLOWER') {
      navigate(`/profile/${payload.actorUsername}`);
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
      <LeftSidebar />

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <main className='mx-auto min-h-full flex-1 px-5 py-6'>
          <div className='mx-auto max-w-2xl'>
            {/* header */}
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/40'>
                <Bell size={22} className='text-slate-100' />
              </div>

              <div>
                <h1 className='text-2xl font-bold text-white'>Notifications</h1>
                <p className='text-sm text-slate-500'>Your recent activity and interactions</p>
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

                <p className='mt-1 text-sm text-slate-600'>Likes, comments and follows will appear here.</p>
              </div>
            ) : (
              <div className='space-y-8'>
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

                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleClick(notification)}
                              className='flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-white/6 bg-[#0f0f0f] p-4 text-left transition hover:border-white/10 hover:bg-[#151515]'
                            >
                              {/* actor avatar */}
                              <img
                                onClick={e => {
                                  e.stopPropagation();
                                  navigate(`/profile/${payload.actorUsername}`);
                                }}
                                src={payload.actorAvatarUrl}
                                alt={payload.actorDisplayName}
                                className='h-12 w-12 shrink-0 cursor-pointer rounded-full border border-white/10 object-cover transition hover:border-red-500 hover:opacity-80'
                              />

                              {/* body */}
                              <div className='min-w-0 flex-1'>
                                <div className='flex items-start justify-between gap-3'>
                                  <div className='min-w-0 flex-1'>
                                    {/* text */}
                                    <p className='text-sm leading-relaxed text-slate-300'>
                                      <span className='font-semibold text-white'>{payload.actorDisplayName}</span>{' '}
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
                                  <span className='shrink-0 pt-0.5 text-xs text-slate-600'>
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
    </div>
  );
};

export default Notifications;
