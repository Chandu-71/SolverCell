import { useState } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { Section, uid } from './Shared';

const TestCaseRow = ({ tc, index, isHidden, onChange, onRemove }) => (
  <div className='group relative rounded-xl border border-white/6 bg-[#0f0f0f] p-4 transition hover:border-white/10'>
    <div className='mb-3 flex items-center justify-between'>
      <span className='flex items-center gap-2 text-xs font-medium text-slate-500'>
        {isHidden ? (
          <>
            <Lock size={11} className='text-red-400' />
            <span className='text-red-400'>Hidden</span> Test case {index + 1}
          </>
        ) : (
          <>Visible Test case</>
        )}
      </span>
      {isHidden && (
        <button
          onClick={onRemove}
          className='cursor-pointer rounded-lg p-1.5 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100'
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>

    <div className='grid grid-cols-2 gap-3'>
      <div className='space-y-1.5'>
        <label className='text-xs text-slate-600'>Input (stdin)</label>
        <textarea
          value={tc.input}
          onChange={e => onChange({ ...tc, input: e.target.value })}
          placeholder={'2 7 11 15\n9'}
          rows={3}
          className='w-full resize-none rounded-lg border border-white/6 bg-black/40 px-3 py-2.5 font-mono text-xs text-slate-300 placeholder-slate-700 outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10'
        />
      </div>
      <div className='space-y-1.5'>
        <label className='text-xs text-slate-600'>Expected output (stdout)</label>
        <textarea
          value={tc.output}
          onChange={e => onChange({ ...tc, output: e.target.value })}
          placeholder={'0 1'}
          rows={3}
          className='w-full resize-none rounded-lg border border-white/6 bg-black/40 px-3 py-2.5 font-mono text-xs text-slate-300 placeholder-slate-700 outline-none focus:border-red-500/30 focus:ring-1 focus:ring-red-500/10'
        />
      </div>
    </div>
  </div>
);

const TestCasesSection = ({ visibleTC, setVisibleTC, hiddenTCs, setHiddenTCs, errors }) => {
  const addTC = setList => setList(l => [...l, { id: uid(), input: '', output: '' }]);
  const removeTC = (setList, id) => setList(l => l.filter(tc => tc.id !== id));
  const updateTC = (setList, id, updated) => setList(l => l.map(tc => (tc.id === id ? { ...tc, ...updated } : tc)));

  return (
    <Section
      number='5'
      title='Test cases'
      subtitle='Visible testcase is shown to solvers. Hidden testcases are used for judging.'
      error={errors.testcases}
    >
      <div className='space-y-4'>
        {/* visible */}
        <div className='space-y-3'>
          <TestCaseRow tc={visibleTC} index={0} isHidden={false} onChange={setVisibleTC} />
        </div>

        <div className='border-t border-white/6 pt-4'>
          <div className='mt-4 space-y-3'>
            {hiddenTCs.map((tc, i) => (
              <TestCaseRow
                key={tc.id}
                tc={tc}
                index={i}
                isHidden
                onChange={u => updateTC(setHiddenTCs, tc.id, u)}
                onRemove={() => removeTC(setHiddenTCs, tc.id)}
              />
            ))}
            <button
              onClick={() => addTC(setHiddenTCs)}
              disabled={hiddenTCs.length >= 10}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition ${
                hiddenTCs.length >= 10
                  ? 'border-slate-700 bg-slate-900 text-slate-500 cursor-not-allowed'
                  : 'border-red-500/20 text-red-400/50 hover:border-red-500/40 hover:text-red-400'
              }`}
            >
              <Plus size={14} /> Add hidden test case
            </button>
            {hiddenTCs.length >= 10 && <p className='text-xs text-slate-500'>Max 10 hidden test cases reached.</p>}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default TestCasesSection;
