import { createContext, useCallback, useEffect, useState } from 'react';
import { useAuth, useSession, useUser } from '@clerk/react';

import Loading from '../components/Loading';

export const CurrentUserContext = createContext(null);

export const CurrentUserProvider = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded: sessionLoaded, session } = useSession();

  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userLoaded || !sessionLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setIsReady(true);
      return;
    }

    setIsReady(false);

    if (!clerkUser || !session) return;

    let cancelled = false;

    const syncUser = async () => {
      try {
        const token = await session.getToken();
        if (!token || cancelled) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: clerkUser.username || clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            displayName:
              clerkUser.fullName ||
              clerkUser.firstName ||
              clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ||
              'Anonymous User',
            avatarUrl: clerkUser.imageUrl,
          }),
        });

        if (cancelled) return;

        if (!res.ok) {
          console.error('User sync failed during startup:', res.status);
          return;
        }

        const data = await res.json();

        if (!data.success) {
          console.error('User sync responded with failure:', data);
          return;
        }

        setUser(data.user);
        setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          console.error('User sync error during startup:', err);
        }
      }
    };

    syncUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, userLoaded, sessionLoaded, isSignedIn, clerkUser, session]);

  const refetch = useCallback(async () => {
    if (!session) return;

    const token = await session.getToken();
    if (!token) return;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error('useCurrentUser refetch failed:', res.status);
      return;
    }

    const data = await res.json();

    if (data.success) {
      setUser(data.user);
    }
  }, [session]);

  if (!isReady) {
    return <Loading />;
  }

  return (
    <CurrentUserContext.Provider value={{ user, isReady, setUser, refetch }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
