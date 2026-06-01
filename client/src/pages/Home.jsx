import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Feed from './Feed';

const Home = () => {
  return (
    <main className='h-screen overflow-hidden bg-black text-white'>
      <div className='mx-auto flex h-full max-w-400 gap-6'>
        <aside className='hidden lg:flex shrink-0'>
          <LeftSidebar />
        </aside>

        <section className='min-w-0 flex-1 overflow-y-auto scrollbar-none py-6'>
          <Feed />
        </section>

        <aside className='hidden xl:block w-90 shrink-0 overflow-y-auto scrollbar-none pr-6 py-6'>
          <RightSidebar />
        </aside>
      </div>
    </main>
  );
};

export default Home;
