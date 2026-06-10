import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import useSocket from './useSocket';
import useCurrentUser from './useCurrentUser';

let globalCount = 0;
let listeners = [];
let initialized = false;
let socketBound = false;

const emit = () => {
  listeners.forEach(listener => listener(globalCount));
};

const setGlobalCount = value => {
  globalCount = value;
  emit();
};

export const resetNotificationCount = () => {
  initialized = false;
  globalCount = 0;
  emit();
};

const useNotificationCount = () => {
  const { isSignedIn, getToken } = useAuth();
  const { isReady } = useCurrentUser();
  const socket = useSocket();

  const [count, setCount] = useState(globalCount);

  useEffect(() => {
    listeners.push(setCount);

    return () => {
      listeners = listeners.filter(l => l !== setCount);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      resetNotificationCount();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isReady || initialized || !isSignedIn) return;

    const fetchCount = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('useNotificationCount fetch failed:', res.status);
          return;
        }

        const data = await res.json();

        if (data.success) {
          const unread = data.notifications.filter(n => !n.read).length;
          setGlobalCount(unread);
          initialized = true;
        }
      } catch (err) {
        console.error('useNotificationCount fetch error:', err);
      }
    };

    fetchCount();
  }, [isReady, isSignedIn, getToken]);

  useEffect(() => {
    if (socketBound) return;

    const onNewNotification = () => {
      setGlobalCount(globalCount + 1);
    };

    socket.on('notification:new', onNewNotification);

    socketBound = true;

    return () => {
      socket.off('notification:new', onNewNotification);
      socketBound = false;
    };
  }, [socket]);

  return {
    count,
    setCount: setGlobalCount,
  };
};

export default useNotificationCount;
