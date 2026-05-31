import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const TestcasePanel = ({ problem, runResult, submitResult, runInput, setRunInput }) => {
  const currentCase = problem?.testCases?.[0];
  const result = submitResult || runResult;
  const isSubmit = Boolean(submitResult);

  return (
    <div className='flex h-full flex-col bg-[#0b0b0b]'>
      <div className='flex items-start pl-5 pt-4'>
        <h2 className='text-md border-b border-white font-semibold tracking-wide text-white'>{isSubmit ? 'Submission Result' : 'Custom Testcase'}</h2>
      </div>

      <div className='flex-1 overflow-y-auto px-5 py-5 scrollbar-none'>
        <div className='space-y-5'>
          {isSubmit ? (
            <div className='space-y-5'>
              <div className='rounded-xl border border-white/10 bg-[#111111] px-5 py-6 text-sm text-slate-300'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center gap-3'>
                    {result.status === 'ACCEPTED' ? (
                      <CheckCircle2 className='h-5 w-5 text-green-400' />
                    ) : (
                      <XCircle className='h-5 w-5 text-red-400' />
                    )}
                    <div>
                      <p className='text-sm text-slate-400'>Overall Status</p>
                      <p className={`text-xl font-semibold ${result.status === 'ACCEPTED' ? 'text-green-300' : 'text-red-300'}`}>{result.status}</p>
                    </div>
                  </div>

                  {result.failedCase && (
                    <div className='rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-red-300'>
                      <p className='font-medium'>Failed Case: {result.failedCase}</p>
                    </div>
                  )}

                  {(result.errorMessage || result.stderr || result.compile_output) && (
                    <div className='rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-red-300'>
                      <p className='font-medium'>Error Details</p>
                      <pre className='whitespace-pre-wrap text-sm leading-6'>{result.errorMessage || result.compile_output || result.stderr}</pre>
                    </div>
                  )}

                  <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                    <div className='rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3'>
                      <p className='text-xs uppercase text-slate-500'>Runtime</p>
                      <p className='mt-2 text-sm text-slate-200'>{result.time || result.runtime ? `${result.time || result.runtime}s` : '-'}</p>
                    </div>
                    <div className='rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3'>
                      <p className='text-xs uppercase text-slate-500'>Memory</p>
                      <p className='mt-2 text-sm text-slate-200'>{result.memory ? `${result.memory} KB` : '-'}</p>
                    </div>
                    <div className='rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3'>
                      <p className='text-xs uppercase text-slate-500'>Language</p>
                      <p className='mt-2 text-sm text-slate-200'>{result.language || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className='mb-2 text-sm font-medium text-slate-400'>Input</p>
                <textarea
                  value={runInput}
                  onChange={e => setRunInput(e.target.value)}
                  placeholder={currentCase?.input || 'Enter input for testing'}
                  rows={8}
                  className='w-full min-h-45 resize-none rounded-xl border border-white/10 bg-[#151515] px-4 py-3 font-mono text-sm leading-7 text-slate-200 outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10'
                />
              </div>

              {result && (
                <div>
                  <p className='mb-2 text-sm font-medium text-slate-400'>Output</p>
                  <div
                    className={`overflow-x-auto whitespace-pre-wrap rounded-xl px-4 py-3 font-mono text-sm leading-7 ${
                      result.stderr || result.compile_output
                        ? 'border border-red-500/10 bg-red-500/5 text-red-300'
                        : 'border border-green-500/10 bg-green-500/5 text-green-300'
                    }`}
                  >
                    {result.compile_output || result.stderr || result.stdout || '(no output)'}
                  </div>
                </div>
              )}

              {result && (
                <div>
                  <p className='mb-2 text-sm font-medium text-slate-400'>Status</p>
                  <div className='rounded-xl border border-white/6 bg-[#111111] px-4 py-3 text-sm space-y-2'>
                    {result.compile_output && (
                      <div className='flex items-start gap-2 text-red-300'>
                        <XCircle className='h-4 w-4 text-red-400 mt-0.5 shrink-0' />
                        <div>
                          <div className='font-medium'>Compilation Error</div>
                        </div>
                      </div>
                    )}

                    {result.stderr && !result.compile_output && (
                      <div className='flex items-start gap-2 text-red-300'>
                        <XCircle className='h-4 w-4 text-red-400 mt-0.5 shrink-0' />
                        <div>
                          <div className='font-medium'>Runtime Error</div>
                        </div>
                      </div>
                    )}

                    {submitResult && !result.compile_output && !result.stderr && (
                      <div className={`flex items-start gap-2 ${submitResult.status === 'ACCEPTED' ? 'text-green-300' : 'text-red-300'}`}>
                        {submitResult.status === 'ACCEPTED' ? (
                          <CheckCircle2 className='h-4 w-4 text-green-400 mt-0.5 shrink-0' />
                        ) : (
                          <XCircle className='h-4 w-4 text-red-400 mt-0.5 shrink-0' />
                        )}
                        <div>
                          <div className='font-medium'>
                            {submitResult.status === 'ACCEPTED' ? 'Accepted' : submitResult.status.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                    )}

                    {(result.time || result.runtime) && <div className='text-slate-300'>Time: {result.time || result.runtime}s</div>}
                    {result.memory && <div className='text-slate-300'>Memory: {result.memory} KB</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestcasePanel;
