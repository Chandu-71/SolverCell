import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { useParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';

import ProblemSidePanel from '../components/workspace/ProblemSidePanel';
import CodeEditorPanel from '../components/workspace/CodeEditorPanel';
import TestcasePanel from '../components/workspace/TestcasePanel';
import LeftSidebar from '../components/LeftSidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import WorkspaceHeader from '../components/workspace/WorkspaceHeader';
import Loading from '../components/Loading';

const Workspace = () => {
  const { problemId } = useParams();
  const { getToken } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [lang, setLang] = useState('python');
  const [runInput, setRunInput] = useState('');
  const [activeSideTab, setActiveSideTab] = useState('description');

  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  const handleRun = async () => {
    try {
      setRunLoading(true);
      setRunResult(null);
      setSubmitResult(null);

      const stdin = runInput || '';

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/code/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: lang,
          stdin,
        }),
      });

      const data = await res.json();

      setRunResult(data);
    } catch (error) {
      console.error(error);

      setRunResult({
        success: false,
        stderr: 'Execution failed',
      });
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setSubmitResult(null);

      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/code/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language: lang,
          problemId,
        }),
      });

      const data = await res.json();

      setSubmitResult(data);
    } catch (error) {
      console.error(error);

      setSubmitResult({
        success: false,
        status: 'SUBMIT_FAILED',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!problemId) return;

    try {
      setSubmissionsLoading(true);
      setSubmissions([]);

      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSideTab !== 'submissions') return;
    fetchSubmissions();
  }, [activeSideTab, problemId]);

  React.useEffect(() => {
    if (submitResult?.success && activeSideTab === 'submissions') {
      fetchSubmissions();
    }
  }, [submitResult, activeSideTab]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = await getToken();

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setProblem(data.problem);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, getToken]);

  React.useEffect(() => {
    if (problem) {
      setRunInput(problem.testCases?.[0]?.input || '');
      setRunResult(null);
      setSubmitResult(null);
    }
  }, [problem]);

  if (loading) {
    return <Loading />;
  }

  if (!problem) {
    return <div className='flex min-h-screen items-center justify-center bg-black text-white'>Problem not found</div>;
  }

  return (
    <main className='h-screen overflow-hidden bg-black text-white'>
      <div className='hidden lg:flex'>
        <LeftSidebar collapsed />
      </div>

      <div className='lg:ml-20 flex h-full flex-col'>
        <WorkspaceHeader problem={problem} onRun={handleRun} runLoading={runLoading} onSubmit={handleSubmit} submitLoading={submitLoading} />

        {/* ── DESKTOP VIEW (hidden on mobile) ── */}
        <div className='hidden lg:block flex-1 overflow-hidden pb-3 pr-2'>
          <div className='h-full overflow-hidden bg-black'>
            <Split className='flex h-full gap-0.4' sizes={[52.8, 47.2]} minSize={0} gutterSize={8}>
              <div className='overflow-hidden rounded-xl border border-white/6 bg-[#0b0b0b]'>
                <ProblemSidePanel
                  problem={problem}
                  activeTab={activeSideTab}
                  setActiveTab={setActiveSideTab}
                  submissions={submissions}
                  submissionsLoading={submissionsLoading}
                />
              </div>

              <Split direction='vertical' className='flex h-full flex-col gap-0.4' sizes={[60, 40]} minSize={0} gutterSize={8}>
                <div className='overflow-hidden rounded-xl border border-white/6 bg-[#0b0b0b]'>
                  <CodeEditorPanel
                    problem={problem}
                    onCodeChange={(c, l) => {
                      setCode(c);
                      setLang(l);
                    }}
                  />
                </div>

                <div className='overflow-hidden rounded-xl border border-white/6 bg-[#0b0b0b]'>
                  <TestcasePanel
                    problem={problem}
                    runResult={runResult}
                    submitResult={submitResult}
                    runInput={runInput}
                    setRunInput={value => {
                      setRunInput(value);
                      setRunResult(null);
                      setSubmitResult(null);
                    }}
                  />
                </div>
              </Split>
            </Split>
          </div>
        </div>

        {/* ── MOBILE VIEW (Vertical Stack, hidden on desktop) ── */}
        <div className='flex lg:hidden flex-1 flex-col overflow-y-auto px-3 pb-24 gap-4 scrollbar-none'>
          {/* Problem Description Panel */}
          <div className='shrink-0 rounded-2xl border border-white/6 bg-[#0b0b0b]'>
            <ProblemSidePanel
              problem={problem}
              activeTab={activeSideTab}
              setActiveTab={setActiveSideTab}
              submissions={submissions}
              submissionsLoading={submissionsLoading}
            />
          </div>

          {/* Code Editor Panel */}
          <div className='h-110 shrink-0 overflow-hidden rounded-2xl border border-white/6 bg-[#0b0b0b]'>
            <CodeEditorPanel
              problem={problem}
              onCodeChange={(c, l) => {
                setCode(c);
                setLang(l);
              }}
            />
          </div>

          {/* Testcases Panel */}
          <div className='h-75 shrink-0 overflow-hidden rounded-2xl border border-white/6 bg-[#0b0b0b]'>
            <TestcasePanel
              problem={problem}
              runResult={runResult}
              submitResult={submitResult}
              runInput={runInput}
              setRunInput={value => {
                setRunInput(value);
                setRunResult(null);
                setSubmitResult(null);
              }}
            />
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </main>
  );
};

export default Workspace;
