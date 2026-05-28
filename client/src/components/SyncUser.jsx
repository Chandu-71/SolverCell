import { useAuth, useUser } from '@clerk/react';
import { useEffect } from 'react';

const SyncUser = () => {
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;

      const token = await getToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: user.username || user.id,
          email: user.primaryEmailAddress?.emailAddress,
          displayName: user.fullName || user.firstName,
          avatarUrl: user.imageUrl,
        }),
      });

      const data = await res.json();
      console.log(data);
    };

    syncUser();
  }, [user]);

  return null;
};

export default SyncUser;
