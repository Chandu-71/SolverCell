import express from 'express';
import prisma from '../lib/prisma.js';
import { getAuth } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { io, emitToUser } from '../index.js';

const router = express.Router();
const MSG_LIMIT = 30;

// ── message shape helper ──────────────────────────────────────
const formatMessage = msg => ({
  id: msg.id,
  conversationId: msg.conversationId,
  type: msg.type,
  body: msg.body,
  status: msg.status,
  seenAt: msg.seenAt,
  createdAt: msg.createdAt,
  sender: {
    id: msg.sender.id,
    username: msg.sender.username,
    displayName: msg.sender.displayName,
    avatarUrl: msg.sender.avatarUrl,
    clerkId: msg.sender.clerkId,
  },
  problem: msg.problem
    ? {
        id: msg.problem.id,
        title: msg.problem.title,
        summary: msg.problem.summary,
        difficulty: msg.problem.difficulty,
        tags: msg.problem.tags?.map(t => t.tag.name) ?? [],
        author: msg.problem.author,
      }
    : null,
});

// ── GET /api/messages/:conversationId ─────────────────────────
// Paginated, cursor-based (before=messageId for infinite scroll upward)
router.get(
  '/:conversationId',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const { conversationId } = req.params;
    const { before } = req.query; // cursor: messageId

    // verify membership
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: me.id } },
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Forbidden' });

    const where = {
      conversationId,
      ...(before ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: before } }))?.createdAt } } : {}),
    };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: MSG_LIMIT,
      include: {
        sender: {
          select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true },
        },
        problem: {
          include: {
            tags: { include: { tag: { select: { name: true } } } },
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    // return oldest-first for the UI to render top→bottom
    res.json({
      success: true,
      messages: messages.reverse().map(formatMessage),
      hasMore: messages.length === MSG_LIMIT,
    });
  }),
);

// ── POST /api/messages ────────────────────────────────────────
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const { conversationId, type = 'TEXT', body, problemId } = req.body;

    if (!conversationId) return res.status(400).json({ success: false, message: 'conversationId required' });
    if (type === 'TEXT' && !body?.trim()) return res.status(400).json({ success: false, message: 'body required for text messages' });
    if (type === 'SHARED_POST' && !problemId) return res.status(400).json({ success: false, message: 'problemId required for shared post' });

    // verify membership
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: me.id } },
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Forbidden' });

    const preview = type === 'TEXT' ? (body.length > 50 ? body.slice(0, 50) + '…' : body) : '📎 Shared a problem';

    // create message + update conversation + increment other participant's unread
    const [message] = await prisma.$transaction(async tx => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: me.id,
          type,
          body: body?.trim() ?? null,
          problemId: problemId ?? null,
          status: 'SENT',
        },
        include: {
          sender: {
            select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true },
          },
          problem: {
            include: {
              tags: { include: { tag: { select: { name: true } } } },
              author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessagePreview: preview, lastMessageAt: new Date() },
      });

      // increment unread for everyone else in the conversation
      await tx.conversationParticipant.updateMany({
        where: { conversationId, userId: { not: me.id } },
        data: { unreadCount: { increment: 1 } },
      });

      return [msg];
    });

    const formatted = formatMessage(message);

    // emit to everyone in the room (including sender for multi-device)
    io.to(conversationId).emit('message:new', formatted);

    // also emit to the other participant's personal socket (for sidebar unread badge)
    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: me.id } },
      include: { user: { select: { clerkId: true } } },
    });
    others.forEach(p => {
      emitToUser(p.user.clerkId, 'conversation:updated', {
        conversationId,
        lastMessagePreview: preview,
        lastMessageAt: new Date(),
      });
    });

    res.status(201).json({ success: true, message: formatted });
  }),
);

// ── PATCH /api/messages/:id/seen ──────────────────────────────
router.patch(
  '/:id/seen',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    if (message.senderId === me.id) return res.json({ success: true }); // sender can't mark own as seen

    await prisma.message.update({
      where: { id: req.params.id },
      data: { status: 'SEEN', seenAt: new Date() },
    });

    io.to(message.conversationId).emit('message:seen', {
      messageId: message.id,
      conversationId: message.conversationId,
      seenBy: userId,
    });

    res.json({ success: true });
  }),
);

// ── POST /api/messages/share-post ──────────────────────────────
router.post(
  '/share-post',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) return res.status(404).json({ success: false, message: 'User not found' });

    const { problemId, targetUsernames, caption } = req.body;
    // targetUsernames: string[]

    if (!problemId) return res.status(400).json({ success: false, message: 'problemId required' });
    if (!Array.isArray(targetUsernames) || targetUsernames.length === 0)
      return res.status(400).json({ success: false, message: 'targetUsernames must be a non-empty array' });
    if (targetUsernames.length > 10) return res.status(400).json({ success: false, message: 'Max 10 recipients at once' });

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const results = [];

    for (const username of targetUsernames) {
      try {
        const target = await prisma.user.findUnique({ where: { username } });
        if (!target || target.id === me.id) continue;

        // find or create conversation
        let conversation = await prisma.conversation.findFirst({
          where: {
            AND: [{ participants: { some: { userId: me.id } } }, { participants: { some: { userId: target.id } } }],
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              participants: {
                create: [{ userId: me.id }, { userId: target.id }],
              },
            },
          });
        }

        const preview = `📎 Shared a problem: ${problem.title}`;

        // create message + update conversation + increment unread
        const message = await prisma.$transaction(async tx => {
          const msg = await tx.message.create({
            data: {
              conversationId: conversation.id,
              senderId: me.id,
              type: 'SHARED_POST',
              body: caption?.trim() || null,
              problemId,
              status: 'SENT',
            },
            include: {
              sender: {
                select: { id: true, clerkId: true, username: true, displayName: true, avatarUrl: true },
              },
              problem: {
                include: {
                  tags: { include: { tag: { select: { name: true } } } },
                  author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                },
              },
            },
          });

          await tx.conversation.update({
            where: { id: conversation.id },
            data: { lastMessagePreview: preview, lastMessageAt: new Date() },
          });

          await tx.conversationParticipant.updateMany({
            where: { conversationId: conversation.id, userId: { not: me.id } },
            data: { unreadCount: { increment: 1 } },
          });

          return msg;
        });

        // emit via socket
        const formatted = {
          id: message.id,
          conversationId: conversation.id,
          type: message.type,
          body: message.body,
          status: message.status,
          createdAt: message.createdAt,
          sender: message.sender,
          problem: message.problem
            ? {
                id: message.problem.id,
                title: message.problem.title,
                summary: message.problem.summary,
                difficulty: message.problem.difficulty,
                tags: message.problem.tags.map(t => t.tag.name),
                author: message.problem.author,
              }
            : null,
        };

        io.to(conversation.id).emit('message:new', formatted);
        emitToUser(target.clerkId, 'conversation:updated', {
          conversationId: conversation.id,
          lastMessagePreview: preview,
          lastMessageAt: new Date(),
        });

        results.push({ username, success: true, conversationId: conversation.id });
      } catch (err) {
        console.error(`Failed to share to ${username}:`, err);
        results.push({ username, success: false });
      }
    }

    res.json({ success: true, results });
  }),
);

export default router;
