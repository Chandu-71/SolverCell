import express from 'express';
import prisma from '../lib/prisma.js';
import { getAuth } from '@clerk/express';
import asyncHandler from '../middleware/asyncHandler.js';

import { getActiveStreak } from '../lib/Solverewards.js';

const router = express.Router();

// GET /api/leaderboard?tab=alltime|weekly
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const tab = req.query.tab === 'weekly' ? 'weekly' : 'alltime';
    const isWeekly = tab === 'weekly';
    const orderField = isWeekly ? 'weeklyScore' : 'eloRating';

    const USER_SELECT = {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      eloRating: true,
      weeklyScore: true,
      currentStreak: true,
      lastSolvedAt: true,
      bestRank: true,
      _count: { select: { solvedProblems: true } },
    };

    const top100 = await prisma.user.findMany({
      where: isWeekly ? { weeklyScore: { gt: 0 } } : undefined,
      orderBy: [{ [orderField]: 'desc' }, { username: 'asc' }],
      take: 100,
      select: USER_SELECT,
    });

    const leaderboard = top100.map((u, i) => ({
      rank: i + 1,
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      eloRating: u.eloRating,
      weeklyScore: u.weeklyScore,
      currentStreak: getActiveStreak(u.currentStreak, u.lastSolvedAt),
      bestRank: u.bestRank,
      solvedCount: u._count.solvedProblems,
      score: isWeekly ? u.weeklyScore : u.eloRating,
    }));

    const totalUsers = await prisma.user.count();

    let myEntry = null;
    if (userId) {
      const me = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: USER_SELECT,
      });

      if (me) {
        const inList = leaderboard.find(u => u.id === me.id);
        let myRank;
        if (inList) {
          myRank = inList.rank;
        } else {
          const aboveMe = await prisma.user.count({
            where: { [orderField]: { gt: me[orderField] } },
          });
          myRank = aboveMe + 1;
        }

        const percentile = Math.ceil((myRank / Math.max(totalUsers, 1)) * 100);

        myEntry = {
          rank: myRank,
          percentile,
          inTop100: !!inList,
          id: me.id,
          username: me.username,
          displayName: me.displayName,
          avatarUrl: me.avatarUrl,
          eloRating: me.eloRating,
          weeklyScore: me.weeklyScore,
          currentStreak: getActiveStreak(me.currentStreak, me.lastSolvedAt),
          bestRank: me.bestRank,
          solvedCount: me._count.solvedProblems,
          score: isWeekly ? me.weeklyScore : me.eloRating,
        };
      }
    }

    res.json({ success: true, leaderboard, myEntry, totalUsers, tab });
  }),
);

export default router;
