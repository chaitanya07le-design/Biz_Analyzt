import { useLocation } from 'react-router-dom';
import { titleForPath } from '../../config/nav';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function Header({ subtitle, actions }) {
  const { pathname } = useLocation();
  const title = titleForPath(pathname);
  const { user } = useAuth();
  const { notificationSettings } = useSettings();
  
  // If any notification setting is enabled, we consider notifications "active"
  const hasNotificationsActive = Object.values(notificationSettings || {}).some(v => v === true);

  return (
    <header className="sticky top-0 z-20 h-16 px-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-line">
      <div className="flex items-center gap-4">
        <div className="flex flex-col justify-center">
          <h1 className="text-base md:text-lg font-semibold text-ink-900 leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-ink-600 mt-1 leading-none">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {actions}
        
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 lg:w-64 pl-9 pr-4 h-9 bg-ink-100 border border-transparent rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
          />
        </div>

        <button className="relative p-2 text-ink-600 hover:bg-ink-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          {hasNotificationsActive && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {user && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-line">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-ink-900">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
