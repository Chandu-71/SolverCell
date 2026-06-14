import { assets } from '../assets/assets';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='bg-black'>
      <div className='mx-auto flex max-w-6xl flex-col gap-5 px-6 pt-5 md:flex-row md:items-center md:justify-between'>
        {/* Brand */}
        <div className='flex items-center gap-3'>
          <img src={assets.logo} alt='SolverCell' className='h-8 w-8 rounded-full object-contain' />

          <div>
            <div className='font-bold uppercase tracking-tight'>
              <span className='text-white'>Solver</span>
              <span className='italic text-red-600'>Cell</span>
            </div>

            <p className='text-xs text-slate-500'>Create challenges, solve problems, and connect with developers</p>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex items-center gap-4 text-xs'>
          <a
            href='https://github.com/Chandu-71'
            target='_blank'
            rel='noopener noreferrer'
            className='text-slate-500 transition-colors hover:text-red-400'
          >
            GitHub
          </a>

          <a
            href='https://www.linkedin.com/in/chandu-tiruvayeepati-44b518286/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-slate-500 transition-colors hover:text-red-400'
          >
            LinkedIn
          </a>

          <a
            href='https://www.instagram.com/chandu_.7'
            target='_blank'
            rel='noopener noreferrer'
            className='text-slate-500 transition-colors hover:text-red-400'
          >
            Instagram
          </a>

          <a href='mailto:chandu.hns7@gmail.com' className='text-slate-500 transition-colors hover:text-red-400'>
            Email
          </a>
        </div>
      </div>

      <div className='mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between'>
        <p className='text-xs text-slate-600'>© {currentYear} SolverCell</p>

        <p className='text-xs text-slate-600'>
          Designed and built by{' '}
          <a
            href='https://chandu-universe.vercel.app'
            target='_blank'
            rel='noopener noreferrer'
            className='font-medium text-red-500 underline underline-offset-2 decoration-red-500/40 transition-colors hover:text-red-400 hover:decoration-red-400'
          >
            CHANDU
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
