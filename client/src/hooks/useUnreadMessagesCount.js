import { useState, useEffect } from 'react';
import { useAuth, useSession } from '@clerk/react';
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
  globalCount = typeof value === 'function' ? value(globalCount) : value;
  emit();
};

export const resetUnreadMessagesCount = () => {
  initialized = false;
  globalCount = 0;
  emit();
};

const useUnreadMessagesCount = () => {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  const { isReady } = useCurrentUser();
  const socket = useSocket();
  const [count, setCount] = useState(globalCount);

  const fetchCount = async () => {
    if (!session) return;

    try {
      const token = await session.getToken();
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error('useUnreadMessagesCount fetch failed:', res.status);
        return;
      }

      const data = await res.json();

      if (data.success && typeof data.count === 'number') {
        setGlobalCount(data.count);
        initialized = true;
      }
    } catch (err) {
      console.error('Failed to load unread messages count:', err);
    }
  };

  useEffect(() => {
    if (!listeners.includes(setCount)) {
      listeners.push(setCount);
    }
    return () => {
      listeners = listeners.filter(listener => listener !== setCount);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      resetUnreadMessagesCount();
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isReady || initialized || !isSignedIn || !session) return;
    fetchCount();
  }, [isReady, isSignedIn, session]);

  useEffect(() => {
    if (socketBound) return;

    const refreshCount = () => {
      fetchCount();
    };

    socket.on('conversation:updated', refreshCount);
    socket.on('message:seen', refreshCount);

    socketBound = true;

    return () => {
      socket.off('conversation:updated', refreshCount);
      socket.off('message:seen', refreshCount);
      socketBound = false;
    };
  }, [socket]);

  return {
    count,
    setCount: setGlobalCount,
  };
};

export default useUnreadMessagesCount;
