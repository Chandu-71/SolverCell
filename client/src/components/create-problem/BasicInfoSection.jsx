import { AlertCircle } from 'lucide-react';
import { Section, Field, inputCls } from './Shared';
import TagPicker from './TagPicker';
import DifficultyPicker from './DifficultyPicker';

const BasicInfoSection = ({ title, setTitle, summary, setSummary, difficulty, setDifficulty, tags, setTags, errors }) => {
  const titleLeft = 150 - title.length;
  const summaryLeft = 280 - summary.length;

  return (
    <>
      {/* ── SECTION 1: BASICS ── */}
      <Section number='1' title='Problem basics' subtitle='Give your problem a clear, specific title and set its difficulty.'>
        <div className='space-y-5'>
          <Field label='Title' required hint={`${titleLeft} left`} error={errors.title}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={150}
              placeholder='e.g. "Find the Longest Increasing Subsequence"'
              className={`${inputCls} ${errors.title ? 'border-red-500/50' : ''}`}
            />
          </Field>

          <Field label='Difficulty' required>
            <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          </Field>

          <Field label='Tags' required hint='up to 8'>
            <TagPicker selected={tags} onChange={setTags} />
            {errors.tags && (
              <p className='mt-1 flex items-center gap-1.5 text-xs text-red-400'>
                <AlertCircle size={12} /> {errors.tags}
              </p>
            )}
          </Field>
        </div>
      </Section>

      {/* ── SECTION 2: FEED PREVIEW ── */}
      <Section
        number='2'
        title='Feed preview'
        subtitle='This is the short teaser users see in the feed before opening your problem.'
        error={errors.summary}
      >
        <Field label='Summary' required hint={`${summaryLeft} left`}>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder='Hook the solver. Why is this problem interesting, tricky, or satisfying?'
            className={`${inputCls} resize-none leading-relaxed ${errors.summary ? 'border-red-500/50' : ''}`}
          />
        </Field>
      </Section>
    </>
  );
};

export default BasicInfoSection;
