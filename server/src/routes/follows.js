import express from 'express';
import prisma from '../lib/prisma.js';
import { getAuth } from '@clerk/express';
import asyncHandler from '../middleware/asyncHandler.js';
import { notify } from '../lib/notify.js';

const router = express.Router();

// FOLLOW USER
router.post(
  '/:username',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { username } = req.params;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (currentUser.id === targetUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: targetUser.id,
      },
    });

    await notify({
      recipientId: targetUser.id,
      type: 'NEW_FOLLOWER',
      payload: {
        actorId: currentUser.id,
      },
    });

    res.json({
      success: true,
      message: 'User followed',
    });
  }),
);

// UNFOLLOW USER
router.delete(
  '/:username',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { username } = req.params;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    res.json({
      success: true,
      message: 'User unfollowed',
    });
  }),
);

// FOLLOW STATUS
router.get(
  '/:username/status',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { username } = req.params;

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    });

    res.json({
      success: true,
      isFollowing: !!follow,
    });
  }),
);

export default router;
