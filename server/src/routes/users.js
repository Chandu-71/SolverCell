import express from 'express';
import prisma from '../lib/prisma.js';
import { getAuth } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.post(
  '/sync',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { username, email, displayName, avatarUrl } = req.body;

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          username,
          email,
          displayName,
          avatarUrl,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          email,
          displayName,
          ...(avatarUrl ? { avatarUrl } : {}),
        },
      });
    }

    res.json({
      success: true,
      user,
    });
  }),
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Compute current all-time rank (by ELO) and current weekly rank
    const [aboveMe, aboveMeWeekly] = await Promise.all([
      prisma.user.count({ where: { eloRating:    { gt: user.eloRating    } } }),
      prisma.user.count({ where: { weeklyScore:  { gt: user.weeklyScore  } } }),
    ]);
    const currentRank = aboveMe + 1;
    const weeklyRank  = aboveMeWeekly + 1;

    res.json({
      success: true,
      user: { ...user, currentRank, weeklyRank },
    });
  }),
);

router.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { displayName, bio, location, username, avatarUrl } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { username, NOT: { clerkId: userId } },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        displayName,
        bio,
        location,
        username,
        // only update avatarUrl if one was provided (Clerk upload succeeded)
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    res.json({ success: true, user: updatedUser });
  }),
);

router.get(
  '/:username/problems',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Format problems helper
    const formatProblems = problems =>
      problems.map(problem => ({
        ...problem,
        tags: problem.tags.map(pt => pt.tag.name),
      }));

    // 1. Fetch authored problems
    const authoredProblems = await prisma.problem.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 2. Fetch solved problems (via SolvedProblem join table)
    const solvedProblems = await prisma.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: user.id,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // 3. Fetch attempted problems (has submission but not solved, and not authored by user)
    const attemptedProblems = await prisma.problem.findMany({
      where: {
        submissions: {
          some: {
            userId: user.id,
            type: 'SUBMIT',
          },
        },
        solvedBy: {
          none: {
            userId: user.id,
          },
        },
        authorId: {
          not: user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      authored: formatProblems(authoredProblems),
      solved: formatProblems(solvedProblems),
      attempted: formatProblems(attemptedProblems),
    });
  }),
);

router.get(
  '/me/bookmarks',
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

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    const problems = bookmarks.map(bookmark => ({
      ...bookmark.problem,
      tags: bookmark.problem.tags.map(pt => pt.tag.name),
    }));

    res.status(200).json({
      success: true,
      problems,
    });
  }),
);

router.get(
  '/:username/follow-data',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      include: {
        followedBy: {
          include: {
            follower: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },

        following: {
          include: {
            following: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,

      followersCount: targetUser.followedBy.length,
      followingCount: targetUser.following.length,

      followers: targetUser.followedBy.map(f => f.follower),
      following: targetUser.following.map(f => f.following),
    });
  }),
);

router.get(
  '/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        location: true,
        joinedAt: true,

        eloRating: true,

        currentStreak: true,
        longestStreak: true,
        lastSolvedAt: true,

        weeklyScore: true,
        bestRank: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Compute ranks dynamically
    const [aboveMe, aboveMeWeekly] = await Promise.all([
      prisma.user.count({ where: { eloRating:   { gt: user.eloRating   } } }),
      prisma.user.count({ where: { weeklyScore: { gt: user.weeklyScore } } }),
    ]);
    const currentRank = aboveMe + 1;
    const weeklyRank  = aboveMeWeekly + 1;

    res.json({
      success: true,
      user: { ...user, currentRank, weeklyRank },
    });
  }),
);

export default router;
