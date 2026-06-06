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

    res.json({
      success: true,
      notifications,
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
