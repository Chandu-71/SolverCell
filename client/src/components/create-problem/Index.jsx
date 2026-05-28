import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@clerk/react';

import LeftSidebar from '../LeftSidebar';
import BasicInfoSection from './BasicInfoSection';
import DescriptionSection from './DescriptionSection';
import TestCasesSection from './TestCasesSection';
import { uid } from './Shared';

// ── helpers ──────────────────────────────────────────────────
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const validate = ({ title, summary, description, tags, visibleTCs }) => {
  const e = {};
  if (!title.trim()) e.title = 'Title is required';
  if (title.length > 150) e.title = 'Max 150 characters';
  if (!summary.trim()) e.summary = 'Summary is required';
  if (summary.length > 280) e.summary = 'Max 280 characters';
  if (!description.trim()) e.description = 'Description is required';
  if (tags.length === 0) e.tags = 'Add at least one tag';
  if (!visibleTCs.every(tc => tc.input.trim() && tc.output.trim())) e.testcases = 'All visible test cases need both input and output';
  return e;
};

// ─── CreateProblemPage ────────────────────────────────────────
const CreateProblemPage = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // ── form state ──
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [constraints, setConstraints] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [visibleTCs, setVisibleTCs] = useState([{ id: uid(), input: '', output: '' }]);
  const [hiddenTCs, setHiddenTCs] = useState([{ id: uid(), input: '', output: '' }]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ── submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate({ title, summary, description, tags, visibleTCs });
    setErrors(e);

    if (Object.keys(e).length > 0) return;

    setSubmitting(true);

    try {
      const token = await getToken();

      const payload = {
        title: title.trim(),
        slug: slugify(title),
        summary: summary.trim(),
        description: description.trim(),
        difficulty,
        tags,

        constraints: constraints.trim() || null,

        starterCode: starterCode.trim() ? { python: starterCode.trim() } : null,

        testCases: visibleTCs.map((tc, i) => ({
          label: `Case ${i + 1}`,
          input: tc.input.trim(),
          expectedOutput: tc.output.trim(),
          explanation: null,
        })),

        hiddenTestCases: hiddenTCs
          .filter(tc => tc.input.trim() && tc.output.trim())
          .map(tc => ({
            input: tc.input.trim(),
            expectedOutput: tc.output.trim(),
          })),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Failed to create problem');
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);

      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
      setSubmitting(false);
    }
  };

  // ── success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15'>
            <CheckCircle2 size={32} className='text-emerald-400' />
          </div>
          <h2 className='text-xl font-semibold text-white'>Problem posted!</h2>
          <p className='text-sm text-slate-500'>Taking you back to the feed…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex bg-black'>
      <LeftSidebar workspace />

      <main className='min-h-screen flex-1 bg-black text-white'>
        <div className='mx-auto max-w-3xl px-6 py-10'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-white'>Post a Problem</h1>
            <p className='mt-1 text-sm text-slate-500'>Share a coding challenge, math puzzle, or aptitude question with the community.</p>
          </div>

          <div className='space-y-5'>
            <BasicInfoSection
              title={title}
              setTitle={setTitle}
              summary={summary}
              setSummary={setSummary}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              tags={tags}
              setTags={setTags}
              errors={errors}
            />

            <DescriptionSection
              description={description}
              setDescription={setDescription}
              constraints={constraints}
              setConstraints={setConstraints}
              starterCode={starterCode}
              setStarterCode={setStarterCode}
              errors={errors}
            />

            <TestCasesSection
              visibleTCs={visibleTCs}
              setVisibleTCs={setVisibleTCs}
              hiddenTCs={hiddenTCs}
              setHiddenTCs={setHiddenTCs}
              errors={errors}
            />

            {/* ── SUBMIT ── */}
            <div className='flex items-center justify-between pb-10 pt-2'>
              <button
                onClick={() => navigate(-1)}
                className='cursor-pointer rounded-xl border border-white/8 px-5 py-2.5 text-sm text-slate-400 transition hover:border-white/20 hover:text-white'
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className='flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {submitting ? (
                  <>
                    <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8z' />
                    </svg>
                    Posting…
                  </>
                ) : (
                  'Post Problem'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProblemPage;
