import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Section, Field, inputCls } from './Shared';

const MarkdownHint = () => (
  <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600'>
    {[
      ['**bold**', 'bold'],
      ['*italic*', 'italic'],
      ['`code`', 'code'],
      ['```block```', 'code block'],
      ['- item', 'list'],
    ].map(([syntax, label]) => (
      <span key={label}>
        <code className='text-slate-500'>{syntax}</code> → {label}
      </span>
    ))}
  </div>
);

const PREVIEW_PROSE =
  'prose prose-invert max-w-none flex-1 overflow-y-auto p-4 ' +
  'prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white ' +
  'prose-li:text-slate-300 prose-code:text-red-300 prose-code:before:hidden ' +
  'prose-code:after:hidden prose-pre:border prose-pre:border-white/6 ' +
  'prose-pre:bg-[#0b0b0b] prose-pre:text-slate-200 ' +
  'prose-blockquote:border-red-500/20 prose-blockquote:text-slate-400';

const DescriptionSection = ({ description, setDescription, constraints, setConstraints, starterCode, setStarterCode, errors }) => {
  const [activeTab, setActiveTab] = useState('edit');

  return (
    <>
      {/* ── SECTION 3: DESCRIPTION ── */}
      <Section number='3' title='Description' subtitle='Explain the problem fully. Use markdown for formatting.' error={errors.description}>
        <div
          className={`flex h-138 flex-col overflow-hidden rounded-xl border bg-[#141414] transition-colors focus-within:border-slate-500/50 ${
            errors.description ? 'border-red-500/50' : 'border-white/8'
          }`}
        >
          {/* header + tab toggle */}
          <div className='flex items-center justify-between border-b border-white/6 bg-[#0f0f0f] px-4 py-2.5'>
            <h3 className='text-sm font-medium text-slate-300'>{activeTab === 'edit' ? 'Markdown Editor' : 'Live Preview'}</h3>
            <div className='flex items-center rounded-lg border border-white/5 bg-black p-1'>
              {['edit', 'preview'].map(tab => (
                <button
                  key={tab}
                  type='button'
                  onClick={() => setActiveTab(tab)}
                  className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab ? 'bg-[#1e1e1e] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'edit' ? 'Write' : 'Preview'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'edit' ? (
            <>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={`Describe the problem clearly.\n\nInclude:\n- Problem statement\n- Input format\n- Output format\n- Examples\n- Constraints`}
                className='w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-600'
              />
              <div className='border-t border-white/6 bg-[#0b0b0b] px-4 py-2.5'>
                <MarkdownHint />
              </div>
            </>
          ) : (
            <div className={PREVIEW_PROSE}>
              {description.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{description}</ReactMarkdown>
              ) : (
                <div className='flex h-full items-center justify-center text-sm text-slate-600'>
                  Nothing to preview yet. Switch to Write to start typing.
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* ── SECTION 4: CONSTRAINTS ── */}
      <Section number='4' title='Constraints' subtitle='Optional but strongly recommended — helps solvers know the input bounds.'>
        <textarea
          value={constraints}
          onChange={e => setConstraints(e.target.value)}
          rows={4}
          placeholder={'- 1 ≤ nums.length ≤ 10⁴\n- -10⁹ ≤ nums[i] ≤ 10⁹\n- Time limit: 2 seconds'}
          className={`${inputCls} resize-none font-mono text-sm`}
        />
      </Section>

      {/* ── SECTION 5: STARTER CODE ── */}
      <Section number='5' title='Starter code' subtitle='Optional — provide a function signature so solvers know what to implement.'>
        <textarea
          value={starterCode}
          onChange={e => setStarterCode(e.target.value)}
          rows={5}
          placeholder={'def twoSum(nums: list[int], target: int) -> list[int]:\n    pass'}
          className={`${inputCls} resize-none font-mono text-sm`}
        />
        <p className='mt-2 text-xs text-slate-600'>Leave blank for open-ended problems (math, aptitude, general programming).</p>
      </Section>
    </>
  );
};

export default DescriptionSection;
