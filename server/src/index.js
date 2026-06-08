import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { createServer } from 'http';
import { Server } from 'socket.io';

import prisma from './lib/prisma.js';
import { getWeekStart } from './lib/Solverewards.js';

import errorHandler from './middleware/errorHandler.js';
import { clerkMiddleware } from '@clerk/express';

import usersRoute from './routes/users.js';
import followRoutes from './routes/follows.js';
import problemRoutes from './routes/problems.js';
import codeRoutes from './routes/code.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const server = createServer(app);

// ── Socket.IO ────────────────────────────────────────────────
export const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

// track online users: Map<clerkId, Set<socketId>>
const onlineUsers = new Map();

io.on('connection', socket => {
  const clerkId = socket.handshake.auth.clerkId;
  if (!clerkId) {
    socket.disconnect();
    return;
  }

  // First active connection for this user
  if (!onlineUsers.has(clerkId)) {
    onlineUsers.set(clerkId, new Set());
    io.emit('user:online', { clerkId });
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
      const viewer = await prisma.user.findUnique({
        where: { clerkId: viewerClerkId },
      });
      if (!viewer) return;

      // mark unseen messages in this conversation as SEEN
      await prisma.message.updateMany({
        where: {
          conversationId,
          status: { not: 'SEEN' },
          senderId: { not: viewer.id },
        },
        data: {
          status: 'SEEN',
          seenAt: new Date(),
        },
      });

      // reset unread count for this participant
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: viewer.id,
        },
        data: {
          unreadCount: 0,
          lastSeenAt: new Date(),
        },
      });

      // tell the other person their messages were seen
      socket.to(conversationId).emit('message:seen', {
        conversationId,
        seenBy: viewerClerkId,
      });
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

  if (!socketIds) return;

  socketIds.forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
};

export const isOnline = clerkId => onlineUsers.has(clerkId);

// ── Express middleware ────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

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
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await finalizePreviousWeek();
});

const finalizePreviousWeek = async () => {
  console.log('[weekly] Finalizing previous week leaderboard…');
  const currentWeekStart = getWeekStart(new Date());

  const staleUserCount = await prisma.user.count({
    where: {
      OR: [{ weeklyScoreWeekStart: null }, { weeklyScoreWeekStart: { lt: currentWeekStart } }],
    },
  });

  if (staleUserCount === 0) {
    return;
  }

  console.log(`[weekly] Detected ${staleUserCount} stale weekly users; finalizing previous week.`);

  try {
    const participants = await prisma.user.findMany({
      where: {
        OR: [{ weeklyScoreWeekStart: null }, { weeklyScoreWeekStart: { lt: currentWeekStart } }],
        weeklyScore: { gt: 0 },
      },
      orderBy: [{ weeklyScore: 'desc' }, { username: 'asc' }],
      select: { id: true, weeklyScore: true, bestRank: true },
    });

    const bestRankUpdates = participants
      .map((user, idx) => {
        const weeklyRank = idx + 1;
        if (user.bestRank === null || weeklyRank < user.bestRank) {
          return prisma.user.update({
            where: { id: user.id },
            data: { bestRank: weeklyRank },
          });
        }
        return null;
      })
      .filter(Boolean);

    if (bestRankUpdates.length > 0) {
      await prisma.$transaction(bestRankUpdates);
      console.log(`[weekly] bestRank updated for ${bestRankUpdates.length} users`);
    }

    const { count } = await prisma.user.updateMany({
      where: {
        OR: [{ weeklyScoreWeekStart: null }, { weeklyScoreWeekStart: { lt: currentWeekStart } }],
      },
      data: {
        weeklyScore: 0,
        weeklyScoreWeekStart: currentWeekStart,
      },
    });

    console.log(`[weekly] Reset ${count} stale weekly scores and marked current week.`);
  } catch (err) {
    console.error('[weekly] Finalization failed:', err);
  }
};

cron.schedule('0 0 * * 1', finalizePreviousWeek);
