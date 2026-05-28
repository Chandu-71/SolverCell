import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import errorHandler from './middleware/errorHandler.js';
import { clerkMiddleware } from './middleware/auth.js';
import prisma from './lib/prisma.js';

import usersRoute from './routes/users.js';
import followRoutes from './routes/follows.js';
import problemRoutes from './routes/problems.js';
import codeRoutes from './routes/code.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const server = createServer(app); // wrap express in http.Server for Socket.IO
const PORT = process.env.PORT || 3000;

// ── Socket.IO ────────────────────────────────────────────────
export const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// track online users: Map<clerkId, socketId>
const onlineUsers = new Map();

io.on('connection', socket => {
  const clerkId = socket.handshake.auth.clerkId;
  if (!clerkId) {
    socket.disconnect();
    return;
  }

  if (!onlineUsers.has(clerkId)) {
    onlineUsers.set(clerkId, new Set());
    io.emit('user:online', { clerkId }); // first connection only
  }

  onlineUsers.get(clerkId).add(socket.id);

  console.log(`🟢 ${clerkId} connected (${socket.id})`);

  // ── join a conversation room ──
  socket.on('conversation:join', conversationId => {
    socket.join(conversationId);
  });

  // ── leave a conversation room ──
  socket.on('conversation:leave', conversationId => {
    socket.leave(conversationId);
  });

  // ── typing indicator ──
  socket.on('typing:start', ({ conversationId, clerkId: typingClerkId }) => {
    socket.to(conversationId).emit('typing:start', { clerkId: typingClerkId });
  });

  socket.on('typing:stop', ({ conversationId, clerkId: typingClerkId }) => {
    socket.to(conversationId).emit('typing:stop', { clerkId: typingClerkId });
  });

  // ── mark seen ──
  socket.on('message:seen', async ({ conversationId, clerkId: viewerClerkId }) => {
    try {
      const viewer = await prisma.user.findUnique({ where: { clerkId: viewerClerkId } });
      if (!viewer) return;

      // mark unseen messages in this conversation as SEEN
      await prisma.message.updateMany({
        where: {
          conversationId,
          status: { not: 'SEEN' },
          senderId: { not: viewer.id },
        },
        data: { status: 'SEEN', seenAt: new Date() },
      });

      // reset unread count for this participant
      await prisma.conversationParticipant.updateMany({
        where: { conversationId, userId: viewer.id },
        data: { unreadCount: 0, lastSeenAt: new Date() },
      });

      // tell the other person their messages were seen
      socket.to(conversationId).emit('message:seen', { conversationId, seenBy: viewerClerkId });
    } catch (err) {
      console.error('seen error:', err);
    }
  });

  // ── disconnect ──
  socket.on('disconnect', () => {
    const userSockets = onlineUsers.get(clerkId);

    if (userSockets) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(clerkId);
        io.emit('user:offline', { clerkId });
      }
    }
    console.log(`🔴 ${clerkId} disconnected`);
  });
});

// helper exported so routes can emit events
export const emitToUser = (clerkId, event, data) => {
  const socketIds = onlineUsers.get(clerkId);

  if (socketIds) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  }
};

export const isOnline = clerkId => onlineUsers.has(clerkId);

// ── Express middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/users', usersRoute);
app.use('/api/follows', followRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

// use server.listen (not app.listen) so Socket.IO works
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
