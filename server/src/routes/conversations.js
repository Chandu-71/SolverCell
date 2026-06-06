import express from 'express';
import prisma from '../lib/prisma.js';
import { getAuth } from '@clerk/express';
import asyncHandler from '../middleware/asyncHandler.js';
import { isOnline } from '../index.js';

const router = express.Router();

// ── GET /api/conversations ────────────────────────────────────
// Returns all conversations for the current user, sorted by
// most recent message, with unread counts and other participant info.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: me.id },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: me.id } }, // the other person
              include: {
                user: {
                  select: {
                    id: true,
                    clerkId: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const conversations = participations.map(p => {
      const other = p.conversation.participants[0]?.user;
      return {
        id: p.conversationId,
        lastMessagePreview: p.conversation.lastMessagePreview,
        lastMessageAt: p.conversation.lastMessageAt,
        unreadCount: p.unreadCount,
        otherUser: other ? { ...other, isOnline: isOnline(other.clerkId) } : null,
      };
    });

    res.json({ success: true, conversations });
  }),
);

// ── GET /api/conversations/unread-count ──────────────────────
router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const result = await prisma.conversationParticipant.aggregate({
      where: { userId: me.id },
      _sum: { unreadCount: true },
    });

    const count = result._sum.unreadCount ?? 0;

    res.json({ success: true, count });
  }),
);

// ── POST /api/conversations ───────────────────────────────────
// Find or create a 1-to-1 conversation between me and targetUsername.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { targetUsername } = req.body;
    if (!targetUsername) return res.status(400).json({ success: false, message: 'targetUsername required' });

    const [me, target] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId } }),
      prisma.user.findUnique({ where: { username: targetUsername } }),
    ]);

    if (!me) return res.status(404).json({ success: false, message: 'Your account not found' });
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (me.id === target.id) return res.status(400).json({ success: false, message: 'Cannot message yourself' });

    // check if a 1-to-1 conversation already exists between these two
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [{ participants: { some: { userId: me.id } } }, { participants: { some: { userId: target.id } } }],
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (existing) {
      const other = existing.participants.find(p => p.userId !== me.id)?.user;
      return res.json({
        success: true,
        conversation: { id: existing.id, otherUser: { ...other, isOnline: isOnline(other.clerkId) } },
        created: false,
      });
    }

    // create new conversation + both participants
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: me.id }, { userId: target.id }],
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    const other = conversation.participants.find(p => p.userId !== me.id)?.user;

    res.status(201).json({
      success: true,
      conversation: { id: conversation.id, otherUser: { ...other, isOnline: isOnline(other.clerkId) } },
      created: true,
    });
  }),
);

// ── GET /api/conversations/:id ────────────────────────────────
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    const isMember = conversation.participants.some(p => p.userId === me.id);
    if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });

    const other = conversation.participants.find(p => p.userId !== me.id)?.user;

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        otherUser: other ? { ...other, isOnline: isOnline(other.clerkId) } : null,
      },
    });
  }),
);

export default router;
