import ProfileCard from './ProfileCard';
import StreakCard from './StreakCard';
import TrendingProblems from './TrendingProblems';
import useCurrentUser from '../hooks/useCurrentUser';

const RightSidebar = () => {
  const { user } = useCurrentUser();

  if (!user) return null;

  return (
    <aside className='sticky top-6 space-y-6'>
      <ProfileCard user={user} />
      <StreakCard user={user} />
      <TrendingProblems />
    </aside>
  );
};

export default RightSidebar;
