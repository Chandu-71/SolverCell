import React, { useState } from 'react';
import { useAuth } from '@clerk/react';
import Editor from '@monaco-editor/react';
import ProblemDescription from './ProblemDescription';

const formatDateTime = dateString => {
  return new Date(dateString).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ProblemSidePanel = ({ problem, activeTab, setActiveTab, submissions, submissionsLoading }) => {
  const { getToken } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedSubmissionLoading, setSelectedSubmissionLoading] = useState(false);
  const [selectedSubmissionError, setSelectedSubmissionError] = useState(null);
  const [copied, setCopied] = useState(false);

  const getLanguageMode = language => {
    const normalized = (language || 'python').toLowerCase();
    if (normalized === 'cpp') return 'cpp';
    if (normalized === 'javascript') return 'javascript';
    if (normalized === 'java') return 'java';
    if (normalized === 'c') return 'c';
    return 'python';
  };

  const openSubmission = async submissionId => {
    setSelectedSubmission({ id: submissionId });
    setSelectedSubmissionLoading(true);
    setSelectedSubmissionError(null);

    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/code/submission/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load submission');
      }

      setSelectedSubmission(data.submission);
    } catch (error) {
      console.error(error);
      setSelectedSubmissionError(error.message || 'Unable to load submission');
    } finally {
      setSelectedSubmissionLoading(false);
    }
  };

  const closeSubmission = () => {
    setSelectedSubmission(null);
    setSelectedSubmissionError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!selectedSubmission?.code) return;
    await navigator.clipboard.writeText(selectedSubmission.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      <div className='flex gap-2 border-b border-white/10 bg-[#080808] px-4 py-3'>
        <button
          onClick={() => setActiveTab('description')}
          className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition ${
            activeTab === 'description'
              ? 'bg-red-500 text-white shadow-[0_0_0_1px_rgba(248,113,113,0.2)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Description
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition ${
            activeTab === 'submissions'
              ? 'bg-red-500 text-white shadow-[0_0_0_1px_rgba(248,113,113,0.2)]'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          Submissions
        </button>
      </div>

      <div className='flex-1 overflow-hidden'>
        {activeTab === 'description' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <div className='h-full overflow-y-auto px-4 py-5 scrollbar-none'>
            <div className='mb-5 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-white'>Your Submissions</h2>
                <p className='text-sm text-slate-400'>Recent submissions for this problem</p>
              </div>
            </div>

            {submissionsLoading ? (
              <div className='rounded-2xl border border-white/10 bg-[#111111] px-6 py-10 text-center text-slate-300'>Loading submissions...</div>
            ) : submissions?.length ? (
              <div className='overflow-x-auto rounded-2xl border border-white/10 bg-[#111111]'>
                <table className='min-w-full text-left text-sm text-slate-300'>
                  <thead className='border-b border-white/10 text-slate-400'>
                    <tr>
                      <th className='px-4 py-3'>Time Submitted</th>
                      <th className='px-4 py-3'>Status</th>
                      <th className='px-4 py-3'>Runtime</th>
                      <th className='px-4 py-3'>Memory</th>
                      <th className='px-4 py-3'>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(submission => (
                      <tr
                        key={submission.id}
                        onClick={() => openSubmission(submission.id)}
                        className='border-b border-white/10 hover:bg-white/5 cursor-pointer'
                      >
                        <td className='px-4 py-4'>{formatDateTime(submission.submittedAt)}</td>
                        <td className='px-4 py-4'>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              submission.status === 'ACCEPTED' ? 'bg-green-500/15 text-green-300' : 'bg-red-500/10 text-red-300'
                            }`}
                          >
                            {submission.status?.replace('_', ' ') || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className='px-4 py-4'>{submission.runtime != null ? `${submission.runtime}s` : '-'}</td>
                        <td className='px-4 py-4'>{submission.memory != null ? `${submission.memory} KB` : '-'}</td>
                        <td className='px-4 py-4'>{submission.language}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='rounded-2xl border border-white/10 bg-[#111111] px-6 py-10 text-center text-slate-400'>
                No submissions yet for this problem.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
          <div className='w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl'>
            <div className='flex flex-col gap-4 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-slate-400'>Submission Code</p>
                <h3 className='text-xl font-semibold text-white'>Attempt from {formatDateTime(selectedSubmission.submittedAt)}</h3>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300'>
                  {selectedSubmission.language}
                </span>
                <span className='rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300'>
                  {selectedSubmission.status?.replace('_', ' ') || 'UNKNOWN'}
                </span>
                <button onClick={handleCopy} className='rounded-full bg-rose-500/15 px-4 py-2 text-sm text-rose-300 cursor-pointer transition hover:bg-rose-500/20'>
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
                <button onClick={closeSubmission} className='rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 cursor-pointer transition hover:bg-white/10'>
                  Close
                </button>
              </div>
            </div>

            <div className='max-h-[75vh] overflow-hidden'>
              {selectedSubmissionLoading ? (
                <div className='flex h-64 items-center justify-center px-6 py-10 text-slate-300'>Loading submission...</div>
              ) : selectedSubmissionError ? (
                <div className='px-6 py-10 text-red-300'>{selectedSubmissionError}</div>
              ) : (
                <Editor
                  height='calc(75vh - 88px)'
                  defaultLanguage={getLanguageMode(selectedSubmission.language)}
                  value={selectedSubmission.code || ''}
                  theme='vs-dark'
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    fontSize: 13,
                    wordWrap: 'on',
                    renderLineHighlight: 'all',
                    scrollbar: {
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6,
                    },
                    contextmenu: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    automaticLayout: true,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemSidePanel;
