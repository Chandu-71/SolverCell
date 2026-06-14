import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@clerk/react';

import LeftSidebar from '../components/LeftSidebar';
import Footer from '../components/Footer';
import BasicInfoSection from '../components/create-problem/BasicInfoSection';
import DescriptionSection from '../components/create-problem/DescriptionSection';
import TestCasesSection from '../components/create-problem/TestCasesSection';
import { uid } from '../components/create-problem/Shared';

// ── helpers ──────────────────────────────────────────────────
const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

const validate = ({ title, summary, description, tags, visibleTC, hiddenTCs }) => {
  const e = {};
  if (!title.trim()) e.title = 'Title is required';
  if (title.trim().length > 150) e.title = 'Max 150 characters';
  if (!summary.trim()) e.summary = 'Summary is required';
  if (summary.trim().length > 280) e.summary = 'Max 280 characters';
  if (!description.trim()) e.description = 'Description is required';
  if (tags.length === 0) e.tags = 'Add at least one tag';
  if (!visibleTC.input.trim() || !visibleTC.output.trim()) {
    e.testcases = 'The visible test case needs both input and output';
  }
  const hiddenFilled = hiddenTCs.filter(tc => tc.input.trim() || tc.output.trim());
  if (hiddenFilled.length === 0) {
    e.testcases = 'Add at least one hidden test case';
  } else if (!hiddenFilled.every(tc => tc.input.trim() && tc.output.trim())) {
    e.testcases = 'Hidden test cases must have both input and output';
  }
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
  const [visibleTC, setVisibleTC] = useState({ id: uid(), input: '', output: '' });
  const [hiddenTCs, setHiddenTCs] = useState([{ id: uid(), input: '', output: '' }]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ── submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validate({ title, summary, description, tags, visibleTC, hiddenTCs });
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

        testCases: [
          {
            label: 'Example',
            input: visibleTC.input.trim(),
            expectedOutput: visibleTC.output.trim(),
          },
        ],

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
        return;
      }

      setSubmitted(true);

      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
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
    <div className='flex h-screen bg-black text-white'>
      <LeftSidebar workspace />

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <main className='flex-1'>
          <div className='mx-auto max-w-3xl px-6 py-10'>
            <div className='mb-8'>
              <h1 className='text-2xl font-bold text-white'>Post a Problem</h1>
              <p className='mt-1 text-sm text-slate-500'>Share a coding challenge with the community.</p>
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
                errors={errors}
              />

              <TestCasesSection visibleTC={visibleTC} setVisibleTC={setVisibleTC} hiddenTCs={hiddenTCs} setHiddenTCs={setHiddenTCs} errors={errors} />

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

        <Footer />
      </div>
    </div>
  );
};

export default CreateProblemPage;
