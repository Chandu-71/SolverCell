import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/react';

// singleton socket
let socket = null;
let initialized = false;

const useSocket = () => {
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    if (initialized && socket?.connected) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL, {
        auth: { clerkId: userId },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        initialized = true;
        console.log('🟢 Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected');
      });
    }
  }, [userId]);

  const joinConversation = useCallback(id => {
    socket?.emit('conversation:join', id);
  }, []);

  const leaveConversation = useCallback(id => {
    socket?.emit('conversation:leave', id);
  }, []);

  const sendTypingStart = useCallback(
    conversationId => {
      socket?.emit('typing:start', { conversationId, clerkId: userId });
    },
    [userId],
  );

  const sendTypingStop = useCallback(
    conversationId => {
      socket?.emit('typing:stop', { conversationId, clerkId: userId });
    },
    [userId],
  );

  const markSeen = useCallback(
    conversationId => {
      socket?.emit('message:seen', { conversationId, clerkId: userId });
    },
    [userId],
  );

  const on = useCallback((event, handler) => {
    socket?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socket?.off(event, handler);
  }, []);

  return {
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markSeen,
    on,
    off,
  };
};

export default useSocket;
