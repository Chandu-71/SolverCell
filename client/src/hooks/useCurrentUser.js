import { useAuth } from '@clerk/react';
import { useEffect, useState } from 'react';

const useCurrentUser = () => {
  const { getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setUser(data.user);
      setLoading(false);
    };

    fetchUser();
  }, [getToken]);

  return { user, loading };
};

export default useCurrentUser;
