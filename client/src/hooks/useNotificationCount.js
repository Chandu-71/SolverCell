import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import useSocket from './useSocket';

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

const useNotificationCount = () => {
  const { getToken } = useAuth();
  const socket = useSocket();

  const [count, setCount] = useState(globalCount);

  // subscribe to shared state
  useEffect(() => {
    listeners.push(setCount);

    return () => {
      listeners = listeners.filter(l => l !== setCount);
    };
  }, []);

  // fetch only once globally
  useEffect(() => {
    if (initialized) return;

    const fetchCount = async () => {
      try {
        const token = await getToken();

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          const unread = data.notifications.filter(n => !n.read).length;

          setGlobalCount(unread);
        }
      } catch (err) {
        console.error(err);
      }
    };

    initialized = true;
    fetchCount();
  }, []);

  // bind socket listener ONLY ONCE
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
  }, []);

  return {
    count,
    setCount: setGlobalCount,
  };
};

export default useNotificationCount;
