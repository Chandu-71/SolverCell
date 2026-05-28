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

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { clerkId: true },
    });

    if (recipient?.clerkId) {
      emitToUser(recipient.clerkId, 'notification:new', notification);
    }

    return notification;
  } catch (err) {
    console.error('notify error:', err);
    return null;
  }
};
