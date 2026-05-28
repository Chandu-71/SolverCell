import ProfileCard from './ProfileCard';
import StreakCard from './StreakCard';
import TrendingProblems from './TrendingProblems';

// Derive trending problems from PROBLEMS data:
// sort by solve count descending, take top 4, add a dummy trend %
const trendingProblems = []
  .sort((a, b) => b.successfulSolves - a.successfulSolves)
  .slice(0, 4)
  .map((p, i) => ({
    ...p,
    trend: [24, 18, 31, 12][i] ?? 10, // dummy weekly trend %
  }));

const RightSidebar = () => {
  return (
    <aside className='sticky top-6 space-y-3'>
      <ProfileCard />
      <StreakCard stats={{ currentStreak: 0, longestStreak: 0, dailyActivity: [1, 0, 1, 1, 0, 1, 1] }} />
      <TrendingProblems problems={trendingProblems} />
    </aside>
  );
};

export default RightSidebar;
