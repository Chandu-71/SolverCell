import { Home, MessageSquare, Search, Bell, Plus } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navbarItems, assets } from '../assets/assets';

import useCurrentUser from '../hooks/useCurrentUser';
import useNotificationCount from '../hooks/useNotificationCount';
import useUnreadMessagesCount from '../hooks/useUnreadMessagesCount';

const iconMap = { Home, MessageSquare, Search, Bell };

const LeftSidebar = ({ collapsed = false }) => {
  const navigate = useNavigate();

  const { count } = useNotificationCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();

  const { user } = useCurrentUser();

  return (
    <aside
      className={`group px-2 py-2 z-50 flex h-screen flex-col bg-black transition-all duration-300 ${collapsed ? 'fixed w-20 hover:w-60' : 'sticky top-0 w-60'}`}
    >
      <div className="mb-20 flex items-center justify-start">
        <img
          onClick={() => navigate('/')}
          src={assets.logo}
          alt="logo"
          className="h-13 w-13 shrink-0 object-contain hover:cursor-pointer rounded-full"
        />
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2">
        {navbarItems.map(item => {
          const Icon = iconMap[item.icon];

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex w-full items-center rounded-2xl border pl-5 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'border-rose-400/30 bg-rose-500/10 text-white shadow-sm shadow-rose-500/10'
                    : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <div className="relative shrink-0">
                <Icon className="h-5 w-5" />

                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}

                {item.label === 'Notifications' && count > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>

              <span
                className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  collapsed ? 'max-w-0 opacity-0 ml-0 group-hover:max-w-50 group-hover:opacity-100 group-hover:ml-3' : 'max-w-50 opacity-100 ml-3'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* CREATE PROBLEM */}
      <div className="mt-8">
        <NavLink
          to="/create"
          className="flex w-full items-center justify-center rounded-2xl bg-[#dc2626] p-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-[#dc2626]/80"
        >
          <Plus className={`h-6 w-6 shrink-0 transition-all ${collapsed ? 'block group-hover:hidden' : 'hidden'}`} />

          <span
            className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${
              collapsed ? 'max-w-0 opacity-0 group-hover:max-w-25 group-hover:opacity-100' : 'max-w-25 opacity-100'
            }`}
          >
            Post
          </span>
        </NavLink>
      </div>

      {/* PROFILE */}
      {user && (
        <button
          onClick={() => navigate('/profile')}
          aria-label={`View profile of ${user.displayName}`}
          className="mt-auto flex w-full cursor-pointer border border-transparent items-center rounded-2xl p-2 transition-all duration-200 hover:bg-white/5 hover:border-white/10"
        >
          <img
            src={user.avatarUrl || '/default-avatar.png'}
            alt={user.username}
            className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/10 object-cover"
          />

          <div
            className={`flex min-w-0 flex-col text-left overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? 'ml-0 max-w-0 opacity-0 group-hover:ml-3 group-hover:max-w-40 group-hover:opacity-100' : 'ml-3 max-w-40 opacity-100'
            }`}
          >
            <span className="truncate text-sm font-medium text-slate-200">
              {user.displayName}
            </span>
            <span className="truncate text-xs text-slate-500">@{user.username}</span>
          </div>
        </button>
      )}
    </aside>
  );
};

export default LeftSidebar;