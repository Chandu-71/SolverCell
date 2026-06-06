import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { getAuth } from '@clerk/express';
import { notify } from '../lib/notify.js';
import { handleFirstSolve } from '../lib/solveRewards.js';

const router = express.Router();

const LANGUAGE_MAP = {
  python: 71,
  cpp: 54,
  c: 50,
  java: 62,
  javascript: 63,
};

const runCode = async (code, languageId, stdin = '') => {
  const response = await fetch('https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=*', {
    method: 'POST',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'judge029.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin,
    }),
  });

  return response.json();
};

router.post(
  '/run',
  asyncHandler(async (req, res) => {
    const { code, language, stdin = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required',
      });
    }

    const languageId = LANGUAGE_MAP[language];

    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
      });
    }

    const data = await runCode(code, languageId, stdin);

    res.json({
      success: true,
      stdout: data.stdout,
      stderr: data.stderr,
      compile_output: data.compile_output,
      status: data.status?.description,
      time: data.time,
      memory: data.memory,
    });
  }),
);

router.post(
  '/submit',
  asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
    const { code, language, problemId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language and problemId are required',
      });
    }

    const languageId = LANGUAGE_MAP[language];

    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
      });
    }

    // find DB user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // find problem
    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        author: {
          select: {
            id: true,
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

    // get hidden testcases
    const hiddenCases = await prisma.testCase.findMany({
      where: {
        problemId,
        isHidden: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    if (hiddenCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hidden testcases found',
      });
    }

    let finalStatus = 'ACCEPTED';
    let finalRuntime = null;
    let finalMemory = null;
    let errorMessage = null;
    let failedCase = null;
    let failedExpected = null;
    let failedGot = null;

    // run all hidden testcases
    for (const testCase of hiddenCases) {
      const result = await runCode(code, languageId, testCase.input);

      // compile/runtime errors
      if (result.compile_output) {
        finalStatus = 'COMPILATION_ERROR';
        errorMessage = result.compile_output;
        break;
      }

      if (result.stderr) {
        finalStatus = 'RUNTIME_ERROR';
        errorMessage = result.stderr;
        break;
      }

      const actual = (result.stdout || '').trim();
      const expected = (testCase.expectedOutput || '').trim();

      if (actual !== expected) {
        finalStatus = 'WRONG_ANSWER';
        failedCase = testCase.label;
        failedExpected = expected;
        failedGot = actual;
        break;
      }

      finalRuntime = parseFloat(result.time || 0);
      finalMemory = result.memory || 0;
    }

    // save submission (always, regardless of status)
    await prisma.submission.create({
      data: {
        userId: dbUser.id,
        problemId,
        language,
        code,
        type: 'SUBMIT',
        status: finalStatus,
        runtime: finalRuntime,
        memory: finalMemory,
        errorMessage,
      },
    });

    // increment attempts (runs on every SUBMIT regardless of verdict)
    await prisma.problem.update({
      where: { id: problemId },
      data: {
        totalAttempts: {
          increment: 1,
        },
      },
    });

    // if accepted
    if (finalStatus === 'ACCEPTED') {
      const isSelfSolve = problem.authorId === dbUser.id;

      if (isSelfSolve) {
        return res.json({
          success: true,
          status: finalStatus,
          language,
          runtime: finalRuntime,
          memory: finalMemory,
          rewards: null,
          selfSolve: true,
        });
      }

      // Award ELO + update streak
      const rewards = await handleFirstSolve({
        userId: dbUser.id,
        problemId: problemId,
        runtime: finalRuntime,
        memory: finalMemory,
      });

      // if it's the user's first time solving it, notify the author
      if (!rewards.alreadySolved) {
        if (problem?.author?.id !== dbUser.id) {
          await notify({
            recipientId: problem.author.id,
            type: 'PROBLEM_SOLVED',
            payload: {
              actorId: dbUser.id,
              actorUsername: dbUser.username,
              actorDisplayName: dbUser.displayName,
              actorAvatarUrl: dbUser.avatarUrl,
              problemId,
              problemTitle: problem.title,
              runtime: finalRuntime,
              memory: finalMemory,
              language,
            },
          });
        }
      }

      // Return early with rewards payload for frontend
      return res.json({
        success: true,
        status: finalStatus, // 'ACCEPTED'
        language,
        runtime: finalRuntime,
        memory: finalMemory,
        rewards: {
          eloGained: rewards.eloGained,
          alreadySolved: rewards.alreadySolved,
          newStreak: rewards.newStreak,
        },
      });
    }

    // Return response for non-ACCEPTED status
    const response = {
      success: true,
      status: finalStatus,
      language,
      runtime: finalRuntime,
      memory: finalMemory,
      errorMessage,
    };

    // Add failure details for wrong answer
    if (finalStatus === 'WRONG_ANSWER') {
      response.failedCase = failedCase;
      response.expected = failedExpected;
      response.got = failedGot;
    }

    res.json(response);
  }),
);

router.get(
  '/submission/:id',
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

    const submission = await prisma.submission.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      select: {
        id: true,
        code: true,
        status: true,
        runtime: true,
        memory: true,
        language: true,
        submittedAt: true,
        errorMessage: true,
      },
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.json({
      success: true,
      submission,
    });
  }),
);

export default router;
