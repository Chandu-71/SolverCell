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

export const handleFirstSolve = async ({ userId, problemId, runtime, memory }) => {
  // ── 1. load everything we need in parallel ─────────────────
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
      select: { currentStreak: true, longestStreak: true, lastSolvedAt: true, eloRating: true },
    }),
  ]);

  if (!problem || !user) return { alreadySolved: false, eloGained: 0, newStreak: 0 };

  // ── 2. already solved — only update best runtime/memory ────
  if (existing) {
    const updates = {};
    if (runtime != null && (existing.bestRuntime == null || runtime < existing.bestRuntime)) {
      updates.bestRuntime = runtime;
    }
    if (memory != null && (existing.bestMemory == null || memory < existing.bestMemory)) {
      updates.bestMemory = memory;
    }
    if (Object.keys(updates).length > 0) {
      await prisma.solvedProblem.update({
        where: { userId_problemId: { userId, problemId } },
        data: updates,
      });
    }
    return { alreadySolved: true, eloGained: 0, newStreak: user.currentStreak };
  }

  // ── 3. first solve — compute ELO and streak ─────────────────
  const eloGained = ELO_REWARDS[problem.difficulty] ?? 0;
  const now = new Date();

  let newStreak = 1; // default: starting fresh

  if (user.lastSolvedAt) {
    const gap = daysBetween(user.lastSolvedAt, now);

    if (gap === 0) {
      // already solved something today — streak stays the same
      newStreak = user.currentStreak;
    } else if (gap === 1) {
      // solved yesterday — extend the streak
      newStreak = user.currentStreak + 1;
    } else {
      // gap > 1 day — streak resets
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, user.longestStreak);

  // ── 4. write everything atomically ──────────────────────────
  await prisma.$transaction([
    prisma.solvedProblem.create({
      data: {
        userId,
        problemId,
        bestRuntime: runtime ?? null,
        bestMemory: memory ?? null,
      },
    }),

    prisma.user.update({
      where: { id: userId },
      data: {
        eloRating: { increment: eloGained },
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

  return { alreadySolved: false, eloGained, newStreak, newLongest };
};
