import { useRef } from 'react';

import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import Feed from './Feed';

const Home = () => {
  const feedContainerRef = useRef(null);

  return (
    <main className='h-screen overflow-hidden bg-black text-white'>
      <div className='mx-auto flex h-full max-w-400 gap-6'>
        <aside className='hidden lg:flex shrink-0'>
          <LeftSidebar />
        </aside>

        <section ref={feedContainerRef} className='min-w-0 flex-1 overflow-y-auto scrollbar-none px-4 py-6 pb-20 lg:px-0 lg:pb-6'>
          <Feed feedContainerRef={feedContainerRef} />
        </section>

        <aside className='hidden xl:block w-90 shrink-0 overflow-y-auto scrollbar-none pr-6 py-6'>
          <RightSidebar />
        </aside>
      </div>

      <MobileBottomNav />
    </main>
  );
};

export default Home;
