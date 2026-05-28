import { DIFFICULTIES } from '../../assets/assets';
import { DIFF_STYLE } from './Shared';

const DifficultyPicker = ({ value, onChange }) => (
  <div className='flex gap-3'>
    {DIFFICULTIES.map(d => (
      <button
        key={d}
        onClick={() => onChange(d)}
        className={`cursor-pointer rounded-xl border px-5 py-2 text-sm font-medium transition-all ${
          value === d ? DIFF_STYLE[d] : 'border-white/8 text-slate-500 hover:border-white/20 hover:text-slate-300'
        }`}
      >
        {d}
      </button>
    ))}
  </div>
);

export default DifficultyPicker;
