import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { getAuth } from '@clerk/express';
import { notify } from '../lib/notify.js';
import { handleFirstSolve } from '../lib/Solverewards.js';

const router = express.Router();

const LANGUAGE_MAP = {
  python: 'python-3.14',
  cpp: 'g++-15',
  c: 'gcc-15',
  java: 'openjdk-25',
  javascript: 'typescript-deno',
  typescript: 'typescript-deno',
  csharp: 'dotnet-csharp-9',
  php: 'php-8.5',
  ruby: 'ruby-4.0',
  go: 'go-1.26',
  rust: 'rust-1.93',
};

const runCode = async (code, compiler, stdin = '') => {
  const response = await fetch('https://api.onlinecompiler.io/api/run-code-sync/', {
    method: 'POST',
    headers: {
      Authorization: process.env.ONLINECOMPILER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      compiler,
      code,
      input: String(stdin || ''),
    }),
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    return {
      status: 'failed',
      error: 'Unable to parse OnlineCompiler response',
      output: '',
      exit_code: null,
      time: null,
      memory: null,
    };
  }

  return {
    status: data?.status || 'failed',
    error: data?.error || (response.ok ? '' : `OnlineCompiler API returned ${response.status}`),
    output: data?.output || '',
    exit_code: data?.exit_code ?? null,
    time: data?.time,
    memory: data?.memory,
  };
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

    const compiler = LANGUAGE_MAP[language];

    if (!compiler) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language',
      });
    }

    const data = await runCode(code, compiler, stdin);

    res.json({
      success: true,
      stdout: data.output || '',
      stderr: data.error || '',
      compile_output: data.error || '',
      status: data.status === 'success' ? 'ACCEPTED' : 'ERROR',
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

    const compiler = LANGUAGE_MAP[language];

    if (!compiler) {
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
      const result = await runCode(code, compiler, testCase.input);

      // Check for errors, compilation issues, runtime issues, or internal API failures
      if (result.status !== 'success') {
        errorMessage = result.error || 'Unknown OnlineCompiler error';

        if (result.exit_code === 124) {
          finalStatus = 'TIME_LIMIT_EXCEEDED';
        } else if (result.exit_code === 137 || result.exit_code === 1 || result.exit_code > 128) {
          finalStatus = 'RUNTIME_ERROR';
        } else {
          finalStatus = 'COMPILATION_ERROR';
        }

        console.error(`Submission failed for problem ${problemId} on hidden case ${testCase.label}:`, {
          status: result.status,
          exit_code: result.exit_code,
          error: result.error,
          output: result.output,
        });

        break;
      }

      const actual = (result.output || '').trim();
      const expected = (testCase.expectedOutput || '').trim();

      if (actual !== expected) {
        finalStatus = 'WRONG_ANSWER';
        failedCase = testCase.label;
        failedExpected = expected;
        failedGot = actual;
        break;
      }

      finalRuntime = Number(result.time) || 0;
      finalMemory = Number(result.memory) || 0;
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
