import { Home, MessageSquare, Compass, Bell, Plus, Trophy } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { navbarItems } from '../assets/assets';

import useCurrentUser from '../hooks/useCurrentUser';
import useNotificationCount from '../hooks/useNotificationCount';
import useUnreadMessagesCount from '../hooks/useUnreadMessagesCount';

const iconMap = { Home, MessageSquare, Compass, Bell, Trophy };

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const { count } = useNotificationCount();
  const { count: unreadMessagesCount } = useUnreadMessagesCount();
  const { user } = useCurrentUser();

  return (
    <nav className='fixed -bottom-px left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-white/10 bg-black px-2 pb-safe lg:hidden'>
      {navbarItems.map(item => {
        const Icon = iconMap[item.icon];
        if (!Icon) return null;

        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center justify-center p-2 transition-all active:scale-95 ${
                isActive ? 'text-red-500' : 'text-white/50 hover:text-white/80'
              }`
            }
          >
            <div className='relative'>
              <Icon className='h-6 w-6' strokeWidth={2.5} />

              {/* Messages Badge */}
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <span className='absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white border border-black'>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}

              {/* Notifications Badge */}
              {item.label === 'Notifications' && count > 0 && (
                <span className='absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white border border-black'>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
          </NavLink>
        );
      })}

      {/* POST BUTTON */}
      <NavLink
        to='/create'
        className={({ isActive }) =>
          `relative flex items-center justify-center p-2 transition-all active:scale-95 ${
            isActive ? 'text-red-500' : 'text-white/50 hover:text-white/80'
          }`
        }
      >
        <div className='flex items-center justify-center rounded-lg border-2 border-current p-0.5'>
          <Plus className='h-5 w-5 shrink-0' strokeWidth={3} />
        </div>
      </NavLink>

      {/* PROFILE BUTTON */}
      <NavLink to='/profile' aria-label='View profile' className='relative flex items-center justify-center p-2 transition-transform active:scale-95'>
        {({ isActive }) => (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className={`h-7 w-7 rounded-full object-cover transition-all ring-1 ring-white/20`}
          />
        )}
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
