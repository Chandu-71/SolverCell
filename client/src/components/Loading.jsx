import React from 'react';
import { assets } from '../assets/assets';

const Loading = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-black'>
      <div className='flex flex-col items-center'>
        {/* LOGO */}
        <div className='relative flex items-center justify-center'>
          {/* GLOW */}
          <div className='absolute h-28 w-28 rounded-full bg-red-500/20 blur-3xl' />

          {/* LOGO */}
          <img src={assets.logo} alt='logo' className='relative z-10 h-20 w-20 animate-pulse object-contain rounded-full' />
        </div>

        {/* TEXT */}
        <div className='mt-6 text-center'>
          <h2 className='text-lg font-semibold tracking-wide text-white'>Loading</h2>

          <div className='mt-3 flex items-center justify-center gap-2'>
            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.3s]' />

            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]' />

            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
