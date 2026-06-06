import { useAuth } from '@clerk/react';
import { useEffect, useState, useCallback } from 'react';

const useCurrentUser = () => {
  const { getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // useCallback so the function reference is stable
  const fetchUser = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch (err) {
      console.error('useCurrentUser fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // refetch is the same stable function — call it after any profile save
  return { user, loading, refetch: fetchUser };
};

export default useCurrentUser;
