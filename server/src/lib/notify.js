import prisma from './prisma.js';
import { emitToUser } from '../index.js';

export const notify = async ({ recipientId, type, payload }) => {
  try {
    // prevent self notifications
    if (!recipientId || payload?.actorId === recipientId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        type,
        payload,
      },
    });

    // resolve actor profile for real-time emission
    let actor = null;
    if (payload?.actorId) {
      actor = await prisma.user.findUnique({
        where: { id: payload.actorId },
        select: { id: true, username: true, avatarUrl: true },
      });
    }

    const enriched = {
      ...notification,
      payload: {
        ...notification.payload,
        actor,
      },
    };

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { clerkId: true },
    });

    if (recipient?.clerkId) {
      emitToUser(recipient.clerkId, 'notification:new', enriched);
    }

    return enriched;
  } catch (err) {
    console.error('notify error:', err);
    return null;
  }
};
