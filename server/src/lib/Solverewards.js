import prisma from './prisma.js';

const ELO_REWARDS = {
  Easy: 5,
  Medium: 10,
  Hard: 20,
};

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysBetween = (a, b) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((startOfDay(b) - startOfDay(a)) / msPerDay);
};

export const getActiveStreak = (currentStreak, lastSolvedAt, now = new Date()) => {
  if (!lastSolvedAt) return 0;
  const gap = daysBetween(lastSolvedAt, now);
  return gap <= 1 ? currentStreak : 0;
};

export const handleFirstSolve = async ({ userId, problemId, runtime, memory }) => {
  const [existing, problem, user] = await Promise.all([
    prisma.solvedProblem.findUnique({
      where: { userId_problemId: { userId, problemId } },
    }),
    prisma.problem.findUnique({
      where: { id: problemId },
      select: { difficulty: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastSolvedAt: true,
        eloRating: true,
      },
    }),
  ]);

  if (!problem || !user) return { alreadySolved: false, eloGained: 0, newStreak: 0 };

  // ── already solved — only update best runtime/memory ────────
  if (existing) {
    const updates = {};
    if (runtime != null && (existing.bestRuntime == null || runtime < existing.bestRuntime)) updates.bestRuntime = runtime;
    if (memory != null && (existing.bestMemory == null || memory < existing.bestMemory)) updates.bestMemory = memory;
    if (Object.keys(updates).length > 0) {
      await prisma.solvedProblem.update({
        where: { userId_problemId: { userId, problemId } },
        data: updates,
      });
    }
    return { alreadySolved: true, eloGained: 0, newStreak: user.currentStreak };
  }

  // ── first solve ───────────────────────────────────────────────
  const points = ELO_REWARDS[problem.difficulty] ?? 0;
  const now = new Date();

  let newStreak = 1;
  if (user.lastSolvedAt) {
    const gap = daysBetween(user.lastSolvedAt, now);
    if (gap === 0) newStreak = user.currentStreak;
    else if (gap === 1) newStreak = user.currentStreak + 1;
    else newStreak = 1;
  }

  const newLongest = Math.max(newStreak, user.longestStreak);

  // ── atomic write ─────────────────────────────────────────────
  // weeklyScore increments alongside ELO.
  // bestRank is NOT updated here — it is only updated by the
  // Monday 00:00 cron job before resetting weeklyScore.
  await prisma.$transaction([
    prisma.solvedProblem.create({
      data: { userId, problemId, bestRuntime: runtime ?? null, bestMemory: memory ?? null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        eloRating: { increment: points },
        weeklyScore: { increment: points }, // weekly leaderboard — resets every Monday
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastSolvedAt: now,
      },
    }),
    prisma.problem.update({
      where: { id: problemId },
      data: { successfulSolves: { increment: 1 } },
    }),
  ]);

  return { alreadySolved: false, eloGained: points, newStreak, newLongest };
};
