import React, { useEffect, useState } from 'react';
import { SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assets } from '../assets/assets';

const Register = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const screenshotItems = [
    { src: assets.shot1, label: 'Messages' },
    { src: assets.shot2, label: 'Problems' },
    { src: assets.shot3, label: 'Feed' },
    { src: assets.shot4, label: 'Profile' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % screenshotItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screenshotItems.length]);

  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Branding Panel */}
      <div className='hidden md:flex md:w-1/2 bg-black flex-col justify-center items-center p-12 text-white border-r border-gray-800'>
        <div className='flex items-center gap-4 mb-6'>
          <img src={assets.logo} alt='SolverCell Logo' className='w-16 h-16 object-contain rounded-full' />

          <h1 className='text-5xl font-extrabold tracking-tight uppercase leading-none'>
            <span className='text-[#f5f5f5]'>Solver</span>
            <span className='text-[#dc2626] italic'>Cell</span>
          </h1>
        </div>

        <p className='text-xl text-gray-400 text-center max-w-md leading-relaxed'>
          Join a new generation of programmers sharing challenges, competing through code, and building recognition in the developer community.
        </p>

        {/* Floating screenshot collage */}
        <div className='relative mt-8 w-full h-90 hidden lg:flex flex-col items-center justify-center'>
          {/* Ambient glow */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] bg-red-500/20 blur-[80px] rounded-full pointer-events-none' />

          <div className='relative flex items-center justify-center gap-6 w-full max-w-5xl px-4'>
            <button
              onClick={() => setActiveIndex(prev => (prev - 1 + screenshotItems.length) % screenshotItems.length)}
              className='z-20 p-3 rounded-full bg-zinc-900/80 text-zinc-400 cursor-pointer border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 shrink-0 shadow-lg'
              aria-label='Previous Slide'
            >
              <span className='sr-only'>Previous</span>
              <ChevronLeft className='w-5 h-5' strokeWidth={2.5} />
            </button>

            <div className='relative w-full max-w-130'>
              {screenshotItems.map((item, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    activeIndex === index ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0'
                  }`}
                >
                  <div className='rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10'>
                    <img src={item.src} alt={`${item.label} interface`} className='w-full aspect-video object-cover object-top' />
                  </div>
                </div>
              ))}

              <div className='w-full aspect-video' />
            </div>

            <button
              onClick={() => setActiveIndex(prev => (prev + 1) % screenshotItems.length)}
              className='z-20 p-3 rounded-full bg-zinc-900/80 text-zinc-400 cursor-pointer border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 shrink-0 shadow-lg'
              aria-label='Next Slide'
            >
              <span className='sr-only'>Next</span>
              <ChevronRight className='w-5 h-5' strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Clerk Auth */}
      <div className='flex w-full md:w-1/2 items-center justify-center bg-[#0a0a0a] px-8'>
        <SignUp
          routing='path'
          path='/register'
          signInUrl='/login'
          forceRedirectUrl='/'
          appearance={{
            theme: dark,

            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#121212',
              colorInputBackground: '#1e1e1e',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              colorTextSecondary: '#9ca3af',
              colorNeutral: '#2a2a2a',
              borderRadius: '12px',
            },

            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },

            elements: {
              card: `
                bg-[#181818]
                border border-gray-800
                shadow-[0_0_50px_rgba(59,130,246,0.08)]
                w-full
                max-w-md
                p-6
                overflow-hidden
              `,

              headerTitle: `
                text-white
                text-3xl
                font-bold
                tracking-tight
              `,

              headerSubtitle: `
                text-gray-400
                text-sm
                mt-1
              `,

              socialButtonsBlockButton: `
                bg-[#202020]
                border border-gray-700
                hover:bg-[#2a2a2a]
                text-white
                transition-all
                h-10
                rounded-xl
              `,

              socialButtonsBlockButtonText: `
                text-white
                font-medium
                text-sm
              `,

              socialButtonsProviderIcon: `
                w-5
                h-5
              `,

              dividerLine: `
                bg-gray-800
              `,

              dividerText: `
                text-gray-500
                text-sm
              `,

              formFieldLabel: `
                text-gray-300
                text-sm
                font-medium
                mb-1
              `,

              formFieldInput: `
                bg-[#101010]
                border border-gray-700
                text-white
                h-10
                rounded-xl
                px-4
                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-500
                transition-all
              `,

              formButtonPrimary: `
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-semibold
                h-10
                rounded-xl
                transition-all
                text-sm
                shadow-lg
                hover:shadow-blue-500/20
              `,

              footerActionText: `
                text-gray-400
                text-sm
              `,

              footerActionLink: `
                text-blue-400
                hover:text-blue-300
                font-medium
                text-sm
              `,

              identityPreviewText: `text-white`,

              formResendCodeLink: `
                text-blue-400
              `,

              otpCodeFieldInput: `
                bg-[#101010]
                border border-gray-700
                text-white
                rounded-xl
              `,
            },
          }}
        />
      </div>
    </div>
  );
};

export default Register;
