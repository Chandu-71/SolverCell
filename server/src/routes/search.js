import express from 'express';
import prisma from '../lib/prisma.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

// GET /api/search?q=...&type=all|problems|users&difficulty=Easy|Medium|Hard&tags=Arrays,Graphs&sort=newest|popular
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      q = '',
      type = 'all',
      difficulty,
      tags, // comma-separated string: "Arrays,Graphs"
      sort = 'newest',
    } = req.query;

    const query = q.trim();

    // ── PROBLEMS ──────────────────────────────────────────────
    let problems = [];

    if (type === 'all' || type === 'problems') {
      const tagList = tags
        ? tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        : [];

      const isBlank = !query && !difficulty && tagList.length === 0 && sort === 'newest';

      if (!isBlank) {
        const where = {
          AND: [
            // text search across title and summary
            query
              ? {
                  OR: [{ title: { contains: query, mode: 'insensitive' } }, { summary: { contains: query, mode: 'insensitive' } }],
                }
              : {},

            // difficulty filter
            difficulty ? { difficulty } : {},

            // tag filter — problem must have ALL listed tags
            tagList.length > 0
              ? {
                  AND: tagList.map(tagName => ({
                    tags: {
                      some: {
                        tag: {
                          name: tagName,
                        },
                      },
                    },
                  })),
                }
              : {},
          ],
        };

        const orderBy =
          sort === 'popular'
            ? { successfulSolves: 'desc' }
            : sort === 'most_attempted'
              ? { totalAttempts: 'desc' }
              : sort === 'most_liked'
                ? { likesCount: 'desc' }
                : { createdAt: 'desc' }; // newest (default)

        const raw = await prisma.problem.findMany({
          where,
          orderBy,
          take: 30,
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
              include: { tag: { select: { name: true } } },
            },
          },
        });

        problems = raw.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          difficulty: p.difficulty,
          createdAt: p.createdAt,
          likesCount: p.likesCount,
          totalAttempts: p.totalAttempts,
          successfulSolves: p.successfulSolves,
          author: p.author,
          tags: p.tags.map(t => t.tag.name),
        }));
      }
    }

    // ── USERS ─────────────────────────────────────────────────
    let users = [];

    if (type === 'all' || type === 'users') {
      if (query) {
        const raw = await prisma.user.findMany({
          where: {
            OR: [{ username: { contains: query, mode: 'insensitive' } }, { displayName: { contains: query, mode: 'insensitive' } }],
          },
          take: 20,
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            eloRating: true,
            _count: {
              select: {
                followedBy: true, // follower count
                solvedProblems: true, // solved count
              },
            },
          },
        });

        users = raw.map(u => ({
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          bio: u.bio,
          eloRating: u.eloRating,
          followersCount: u._count.followedBy,
          solvedCount: u._count.solvedProblems,
        }));
      }
    }

    res.json({
      success: true,
      query,
      problems,
      users,
    });
  }),
);

export default router;
