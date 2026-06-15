import express from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { getAuth } from '@clerk/express';

const router = express.Router();

// GET notifications
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: dbUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // collect unique actor IDs from all notification payloads
    const actorIds = [...new Set(notifications.map(n => n.payload?.actorId).filter(Boolean))];

    // batch-fetch current actor profiles
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, username: true, avatarUrl: true },
        })
      : [];

    const actorMap = Object.fromEntries(actors.map(a => [a.id, a]));

    // inject live actor data into each notification payload
    const enriched = notifications.map(n => {
      const actor = actorMap[n.payload?.actorId] || null;
      return {
        ...n,
        payload: {
          ...n.payload,
          actor, // { id, username, displayName, avatarUrl } or null (deleted user)
        },
      };
    });

    res.json({
      success: true,
      notifications: enriched,
    });
  }),
);

// MARK ALL AS READ
router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await prisma.notification.updateMany({
      where: {
        recipientId: dbUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({
      success: true,
    });
  }),
);

export default router;
