import { useContext } from 'react';

import { CurrentUserContext } from '../context/CurrentUserContext';

const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext);

  if (!ctx) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  }

  const { user, isReady, refetch } = ctx;

  return {
    user,
    loading: !isReady,
    isReady,
    refetch,
  };
};

export default useCurrentUser;
