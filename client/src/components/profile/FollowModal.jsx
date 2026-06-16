import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { useAuth } from '@clerk/react';
import useCurrentUser from '../../hooks/useCurrentUser';

// ── Individual User Row ──
const UserRow = ({ user, onNavigate, isOwnFollowingList }) => {
  const { getToken } = useAuth();
  const { user: currentUser } = useCurrentUser();

  const [isFollowing, setIsFollowing] = useState(isOwnFollowingList ? true : user.isFollowing || false);
  const [loading, setLoading] = useState(false);

  const isMe = currentUser?.username === user.username;

  const handleFollowToggle = async e => {
    e.stopPropagation(); // Prevents the row click from navigating away
    if (loading) return;

    setLoading(true);
    try {
      const token = await getToken();
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/follows/${user.username}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setIsFollowing(prev => !prev);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-between px-5 py-4 transition hover:bg-white/3'>
      {/* USER INFO */}
      <div onClick={() => onNavigate(user.username)} className='flex cursor-pointer items-center gap-4'>
        <img src={user.avatarUrl} alt={user.username} className='h-12 w-12 rounded-full border border-white/10 object-cover' />
        <div>
          <h3 className='font-medium text-white'>{user.username}</h3>
          <p className='text-sm text-slate-400'>{user.displayName}</p>
        </div>
      </div>

      {/* FOLLOW BUTTON */}
      {!isMe && (
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-70 ${
            isFollowing
              ? 'border border-white/8 bg-white/4 text-white hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300'
              : 'border border-transparent bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

// ── Main Modal Component ──
const FollowModal = ({ title, users, onClose, isOwnProfile }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleUserClick = username => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const filteredUsers = users.filter(
    user => user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isOwnFollowingList = isOwnProfile && title === 'Following';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
      <div className='flex h-130 sm:h-150 w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0a0a0a] shadow-2xl'>
        {/* HEADER */}
        <div className='flex items-center justify-between border-b border-white/6 px-6 py-4'>
          <h2 className='text-lg font-semibold text-white'>{title}</h2>
          <button onClick={onClose} className='cursor-pointer rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white'>
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* SEARCH */}
        <div className='border-b border-white/6 p-4'>
          <div className='flex items-center gap-3 rounded-2xl bg-white/4 px-4 py-3'>
            <Search className='h-4 w-4 text-slate-500' />
            <input
              type='text'
              placeholder='Search'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500'
            />
          </div>
        </div>

        {/* USER LIST */}
        <div className='flex-1 overflow-y-auto'>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => <UserRow key={user.id} user={user} onNavigate={handleUserClick} isOwnFollowingList={isOwnFollowingList} />)
          ) : (
            <div className='flex h-full items-center justify-center text-sm text-slate-500'>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowModal;
