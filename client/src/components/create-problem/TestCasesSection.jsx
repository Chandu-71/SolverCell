import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { Section, uid } from './Shared';

const TestCaseRow = ({ tc, index, isHidden, totalVisible, onChange, onRemove }) => (
  <div className='group relative rounded-xl border border-white/6 bg-[#0f0f0f] p-4 transition hover:border-white/10'>
    <div className='mb-3 flex items-center justify-between'>
      <span className='flex items-center gap-2 text-xs font-medium text-slate-500'>
        {isHidden ? (
          <>
            <Lock size={11} className='text-amber-400' />
            <span className='text-amber-400'>Hidden</span> test {index + 1}
          </>
        ) : (
          <>Test case {index + 1}</>
        )}
      </span>
      {(isHidden || totalVisible > 1) && (
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

const TestCasesSection = ({ visibleTCs, setVisibleTCs, hiddenTCs, setHiddenTCs, errors }) => {
  const [showHidden, setShowHidden] = useState(false);

  const addTC = (list, setList) => setList(l => [...l, { id: uid(), input: '', output: '' }]);
  const removeTC = (list, setList, id) => setList(l => l.filter(tc => tc.id !== id));
  const updateTC = (list, setList, id, updated) => setList(l => l.map(tc => (tc.id === id ? { ...tc, ...updated } : tc)));

  return (
    <Section
      number='6'
      title='Test cases'
      subtitle='Visible cases are shown to the solver. Hidden ones are used for judging only.'
      error={errors.testcases}
    >
      <div className='space-y-4'>
        {/* visible */}
        <div className='space-y-3'>
          {visibleTCs.map((tc, i) => (
            <TestCaseRow
              key={tc.id}
              tc={tc}
              index={i}
              isHidden={false}
              totalVisible={visibleTCs.length}
              onChange={u => updateTC(visibleTCs, setVisibleTCs, tc.id, u)}
              onRemove={() => removeTC(visibleTCs, setVisibleTCs, tc.id)}
            />
          ))}
          <button
            onClick={() => addTC(visibleTCs, setVisibleTCs)}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-500 transition hover:border-white/25 hover:text-slate-300'
          >
            <Plus size={14} /> Add visible test case
          </button>
        </div>

        {/* hidden toggle */}
        <div className='border-t border-white/6 pt-4'>
          <button
            onClick={() => setShowHidden(v => !v)}
            className='flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition hover:text-slate-300'
          >
            {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            {showHidden ? 'Hide' : 'Add hidden test cases'}
            <span className='ml-1 rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-xs text-amber-400'>
              <Lock size={9} className='mr-0.5 inline' /> judging only
            </span>
          </button>

          {showHidden && (
            <div className='mt-4 space-y-3'>
              {hiddenTCs.map((tc, i) => (
                <TestCaseRow
                  key={tc.id}
                  tc={tc}
                  index={i}
                  isHidden
                  totalVisible={hiddenTCs.length}
                  onChange={u => updateTC(hiddenTCs, setHiddenTCs, tc.id, u)}
                  onRemove={() => removeTC(hiddenTCs, setHiddenTCs, tc.id)}
                />
              ))}
              <button
                onClick={() => addTC(hiddenTCs, setHiddenTCs)}
                className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/15 px-4 py-3 text-sm text-amber-600 transition hover:border-amber-500/30 hover:text-amber-400'
              >
                <Plus size={14} /> Add hidden test case
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};

export default TestCasesSection;
