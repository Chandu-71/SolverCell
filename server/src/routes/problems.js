import express from 'express';
import prisma from '../lib/prisma.js';
import { notify } from '../lib/notify.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { getAuth } from '@clerk/express';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    let currentUser = null;
    let followingIds = new Set();

    if (userId) {
      currentUser = await prisma.user.findUnique({
        where: { clerkId: userId },

        include: {
          following: {
            select: {
              followingId: true,
            },
          },
        },
      });

      if (currentUser) {
        followingIds = new Set(currentUser.following.map(f => f.followingId));
      }
    }

    const problems = await prisma.problem.findMany({
      orderBy: {
        createdAt: 'desc',
      },

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
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        solvedBy: currentUser
          ? {
              where: {
                userId: currentUser.id,
              },
              select: {
                userId: true,
              },
            }
          : false,
      },
    });

    const formattedProblems = problems.map(problem => ({
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      summary: problem.summary,
      difficulty: problem.difficulty,
      createdAt: problem.createdAt,

      likesCount: problem.likesCount,
      sharesCount: problem.sharesCount,
      totalAttempts: problem.totalAttempts,
      successfulSolves: problem.successfulSolves,
      commentsCount: problem.commentsCount,

      author: {
        ...problem.author,
        isFollowing: currentUser ? followingIds.has(problem.author.id) : false,
      },

      tags: problem.tags.map(t => t.tag.name),

      solved: currentUser ? problem.solvedBy.length > 0 : false,
    }));

    res.json({
      success: true,
      problems: formattedProblems,
    });
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { title, slug, summary, description, difficulty, tags, constraints, testCases, hiddenTestCases } = req.body;

    const visibleTestCases = Array.isArray(testCases) ? testCases : [];
    const visiblePresent = visibleTestCases.filter(tc => tc.input?.trim() || tc.expectedOutput?.trim());
    const visibleCases = visiblePresent.filter(tc => tc.input?.trim() && tc.expectedOutput?.trim());
    const hiddenCases = Array.isArray(hiddenTestCases) ? hiddenTestCases.filter(tc => tc.input?.trim() && tc.expectedOutput?.trim()) : [];

    if (visiblePresent.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A visible test case with input and output is required',
      });
    }

    if (visiblePresent.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'Only one visible test case is allowed',
      });
    }

    if (visibleCases.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'The visible test case needs both input and output',
      });
    }

    if (hiddenCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one hidden test case with input and output is required',
      });
    }

    if (hiddenCases.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'A maximum of 10 hidden test cases is allowed',
      });
    }

    const existingProblem = await prisma.problem.findUnique({
      where: { slug },
    });

    if (existingProblem) {
      return res.status(400).json({
        success: false,
        message: 'A problem with this title already exists',
      });
    }

    const problem = await prisma.problem.create({
      data: {
        authorId: currentUser.id,
        title,
        slug,
        summary,
        description,
        difficulty,
        constraints,

        tags: {
          create: await Promise.all(
            tags.map(async tagName => {
              let tag = await prisma.tag.findUnique({
                where: { name: tagName },
              });

              if (!tag) {
                tag = {
                  data: { name: tagName },
                };
              }

              return {
                tagId: tag.id,
              };
            }),
          ),
        },

        testCases: {
          create: [
            ...visibleCases.map((tc, i) => ({
              label: tc.label || `Case ${i + 1}`,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: false,
              orderIndex: i,
            })),

            ...hiddenCases.map((tc, i) => ({
              label: `Hidden ${i + 1}`,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: true,
              orderIndex: visibleCases.length + i,
            })),
          ],
        },
      },
    });

    res.status(201).json({
      success: true,
      problem,
    });
  }),
);

router.get(
  '/:id/like-status',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        liked: false,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return res.json({
        success: true,
        liked: false,
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    res.json({
      success: true,
      liked: !!existingLike,
    });
  }),
);

router.post(
  '/:id/like',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    if (existingLike) {
      const problem = await prisma.problem.findUnique({
        where: { id },
        select: { likesCount: true },
      });

      return res.json({
        success: true,
        liked: true,
        likesCount: problem.likesCount,
      });
    }

    const updatedProblem = await prisma.$transaction(async tx => {
      await tx.like.create({
        data: {
          userId: dbUser.id,
          problemId: id,
        },
      });

      return await tx.problem.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
        select: {
          likesCount: true,
        },
      });
    });

    const problem = await prisma.problem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (problem) {
      await notify({
        recipientId: problem.authorId,
        type: 'PROBLEM_LIKED',
        payload: {
          actorId: dbUser.id,
          actorUsername: dbUser.username,
          actorDisplayName: dbUser.displayName,
          actorAvatarUrl: dbUser.avatarUrl,

          problemId: problem.id,
          problemTitle: problem.title,
        },
      });
    }

    res.json({
      success: true,
      liked: true,
      likesCount: updatedProblem.likesCount,
    });
  }),
);

router.delete(
  '/:id/like',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    if (!existingLike) {
      const problem = await prisma.problem.findUnique({
        where: { id },
        select: { likesCount: true },
      });

      return res.json({
        success: true,
        liked: false,
        likesCount: problem.likesCount,
      });
    }

    const updatedProblem = await prisma.$transaction(async tx => {
      await tx.like.delete({
        where: {
          userId_problemId: {
            userId: dbUser.id,
            problemId: id,
          },
        },
      });

      return await tx.problem.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
        select: {
          likesCount: true,
        },
      });
    });

    res.json({
      success: true,
      liked: false,
      likesCount: updatedProblem.likesCount,
    });
  }),
);

router.get(
  '/:id/save-status',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        saved: false,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return res.json({
        success: true,
        saved: false,
      });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    res.json({
      success: true,
      saved: !!existingBookmark,
    });
  }),
);

router.post(
  '/:id/save',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    if (!existingBookmark) {
      await prisma.bookmark.create({
        data: {
          userId: dbUser.id,
          problemId: id,
        },
      });
    }

    res.json({
      success: true,
      saved: true,
    });
  }),
);

router.delete(
  '/:id/save',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_problemId: {
          userId: dbUser.id,
          problemId: id,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          userId_problemId: {
            userId: dbUser.id,
            problemId: id,
          },
        },
      });
    }

    res.json({
      success: true,
      saved: false,
    });
  }),
);

router.get(
  '/trending',
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit ?? '5'), 20);

    const problems = await prisma.problem.findMany({
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    const now = Date.now();

    // Trending formula
    const scored = problems
      .map(p => {
        const raw = p.likesCount * 3 + p.commentsCount * 4 + p.sharesCount * 6 + p.successfulSolves * 5;

        const ageInDays = (now - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const trendingScore = raw / Math.pow(ageInDays + 2, 1.5);

        return { ...p, trendingScore, rawScore: raw };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    const formatted = scored.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      trendingScore: Math.round(p.trendingScore * 100) / 100,
      author: p.author,
    }));

    res.json({ success: true, problems: formatted });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id },

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
            tag: {
              select: {
                name: true,
              },
            },
          },
        },

        testCases: {
          where: {
            isHidden: false,
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.json({
      success: true,

      problem: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        summary: problem.summary,
        description: problem.description,
        difficulty: problem.difficulty,
        constraints: problem.constraints,
        createdAt: problem.createdAt,

        likesCount: problem.likesCount,
        sharesCount: problem.sharesCount,
        totalAttempts: problem.totalAttempts,
        successfulSolves: problem.successfulSolves,
        commentsCount: problem.commentsCount,

        author: problem.author,

        tags: problem.tags.map(t => t.tag.name),

        testCases: problem.testCases,
      },
    });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const me = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!me) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // only the author can delete
    if (problem.authorId !== me.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // SolvedProblem and Submission don't have onDelete: Cascade on the problem
    // relation, so delete them manually before deleting the problem.
    // Everything else (TestCase, Like, Comment, Bookmark, ProblemTag) has
    // onDelete: Cascade and will be cleaned up automatically.
    // Message.problemId has onDelete: SetNull — messages are kept, problemId nulled.
    await prisma.$transaction([
      prisma.solvedProblem.deleteMany({ where: { problemId: id } }),
      prisma.submission.deleteMany({ where: { problemId: id } }),
      prisma.problem.delete({ where: { id } }),
    ]);

    res.json({ success: true, message: 'Problem deleted' });
  }),
);

router.get(
  '/:id/submissions',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;

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

    const submissions = await prisma.submission.findMany({
      where: {
        problemId: id,
        userId: dbUser.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        runtime: true,
        memory: true,
        language: true,
        submittedAt: true,
      },
    });

    res.json({
      success: true,
      submissions,
    });
  }),
);

router.get(
  '/:id/comments',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page ?? '1');
    const limit = parseInt(req.query.limit ?? '5');
    const skip = (page - 1) * limit;

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where: { problemId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.comment.count({ where: { problemId: id } }),
    ]);

    res.json({
      success: true,
      comments,
      total,
      page,
      hasMore: skip + comments.length < total,
    });
  }),
);

router.post(
  '/:id/comments',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { id } = req.params;
    const { body } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!body?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    if (body.trim().length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment too long (max 1000 characters)' });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // create comment + increment counter
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: { userId: dbUser.id, problemId: id, body: body.trim() },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.problem.update({
        where: { id },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    await notify({
      recipientId: problem.authorId,
      type: 'PROBLEM_COMMENTED',
      payload: {
        actorId: dbUser.id,
        actorUsername: dbUser.username,
        actorDisplayName: dbUser.displayName,
        actorAvatarUrl: dbUser.avatarUrl,

        problemId: problem.id,
        problemTitle: problem.title,

        commentId: comment.id,
        commentBody: comment.body.slice(0, 120),
      },
    });

    res.status(201).json({ success: true, comment });
  }),
);

router.delete(
  '/:id/comments/:commentId',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { commentId, id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.problemId !== id) {
      return res.status(400).json({
        success: false,
        message: 'Comment does not belong to this problem',
      });
    }

    // only the comment author can delete
    if (comment.userId !== dbUser.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.$transaction(async tx => {
      await tx.comment.delete({
        where: { id: commentId },
      });

      const problem = await tx.problem.findUnique({
        where: { id },
        select: { commentsCount: true },
      });

      await tx.problem.update({
        where: { id },
        data: {
          commentsCount: Math.max(0, problem.commentsCount - 1),
        },
      });
    });

    res.json({ success: true });
  }),
);

export default router;
