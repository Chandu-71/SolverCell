import { useState, useEffect } from 'react';
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
  globalCount = typeof value === 'function' ? value(globalCount) : value;
  emit();
};

const useUnreadMessagesCount = () => {
  const { getToken } = useAuth();
  const socket = useSocket();
  const [count, setCount] = useState(globalCount);

  const fetchCount = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success && typeof data.count === 'number') {
        setGlobalCount(data.count);
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
    if (initialized) return;
    initialized = true;
    fetchCount();
  }, [getToken]);

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
