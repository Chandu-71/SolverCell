import { useEffect, useState, useRef } from 'react';
import { assets } from '../assets/assets';

const HEALTH_URL = `${import.meta.env.VITE_API_URL}/health`;
const SLOW_THRESHOLD_MS = 3000; // if health takes longer than 3s, backend was asleep

const BackendWakeGuard = ({ children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready'
  const slowTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // After 3s of waiting, switch from generic "checking" to "waking" message
    slowTimer.current = setTimeout(() => {
      if (!cancelled) setStatus('waking');
    }, SLOW_THRESHOLD_MS);

    const ping = async () => {
      try {
        const res = await fetch(HEALTH_URL);
        if (!cancelled && res.ok) {
          clearTimeout(slowTimer.current);
          setStatus('ready');
        } else {
          setTimeout(ping, 2000);
        }
      } catch {
        // Backend not up yet — retry after a short delay
        if (!cancelled) {
          setTimeout(ping, 2000);
        }
      }
    };

    ping();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer.current);
    };
  }, []);

  if (status === 'ready') return children;

  return (
    <div className='flex min-h-screen items-center justify-center bg-black'>
      <div className='flex flex-col items-center max-w-md px-6'>
        {/* LOGO */}
        <div className='relative flex items-center justify-center'>
          <div className='absolute h-28 w-28 rounded-full bg-red-500/20 blur-3xl' />
          <img src={assets.logo} alt='SolverCell' className='relative z-10 h-20 w-20 animate-pulse object-contain rounded-full' />
        </div>

        {/* TEXT — changes based on status */}
        <div className='mt-6 text-center'>
          {status === 'waking' ? (
            <>
              <h2 className='text-lg font-semibold tracking-wide text-white'>Waking up SolverCell backend servers…</h2>
              <p className='mt-3 text-sm text-zinc-400 leading-relaxed'>
                The server is hosted on Render free tier and may take up to a minute to start after inactivity.
              </p>
              <p className='mt-1 text-xs text-zinc-500'>This only happens after periods of inactivity.</p>
            </>
          ) : (
            <h2 className='text-lg font-semibold tracking-wide text-white'>Loading</h2>
          )}

          {/* Bouncing dots */}
          <div className='mt-4 flex items-center justify-center gap-2'>
            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.3s]' />
            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500 [animation-delay:-0.15s]' />
            <span className='h-2 w-2 animate-bounce rounded-full bg-red-500' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendWakeGuard;
