import React from 'react';
import { SignUp } from '@clerk/react';
import { dark } from '@clerk/themes';
import { assets } from '../assets/assets';

const Register = () => {
  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Branding Panel */}
      <div className='hidden md:flex md:w-1/2 bg-[#0a0a0a] flex-col justify-center items-center p-12 text-white border-r border-gray-800'>
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

        <div className='mt-12 w-64 h-64 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-600'>
          [App UI Preview Image]
        </div>
      </div>

      {/* Right Side - Clerk Auth */}
      <div className='flex w-full md:w-1/2 items-center justify-center bg-[#000000] px-8'>
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
