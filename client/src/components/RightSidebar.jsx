import ProfileCard from './ProfileCard';
import StreakCard from './StreakCard';
import TrendingProblems from './TrendingProblems';
import { CURRENT_USER, PROBLEMS } from '../assets/assets';

// Derive trending problems from PROBLEMS data:
// sort by solve count descending, take top 4, add a dummy trend %
const trendingProblems = [...PROBLEMS]
  .sort((a, b) => b.successfulSolves - a.successfulSolves)
  .slice(0, 4)
  .map((p, i) => ({
    ...p,
    trend: [24, 18, 31, 12][i] ?? 10,          // dummy weekly trend %
  }));

const RightSidebar = () => {
  return (
    <aside className='sticky top-6 space-y-3'>
      <ProfileCard />
      <StreakCard stats={CURRENT_USER.stats} />
      <TrendingProblems problems={trendingProblems} />
    </aside>
  );
};

export default RightSidebar;