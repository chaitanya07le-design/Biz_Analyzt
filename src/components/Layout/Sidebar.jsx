import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../config/nav';
import { Menu, X, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { currentCompany } = useCompany();

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-line flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold">
          B
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-ink-900 truncate">BizAnalyzt</div>
            {currentCompany && (
              <div className="text-xs text-ink-600 truncate">{currentCompany.name}</div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const isActive = pathname.startsWith(item.path);
            return (
              <div key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 h-10 px-3 rounded-2xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-ink-900'
                      : 'text-ink-600 hover:bg-ink-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 opacity-70" />
                  {!collapsed && item.label}
                </Link>
                {isActive && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-medium transition-colors ${
                            childActive
                              ? 'bg-brand-100 text-brand-700'
                              : 'text-ink-600 hover:bg-ink-100'
                          }`}
                        >
                          <child.icon className="w-4 h-4 opacity-70" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 h-10 px-3 rounded-2xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-50 text-ink-900'
                  : 'text-ink-600 hover:bg-ink-100'
              }`}
            >
              <item.icon className="w-5 h-5 opacity-70" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-line">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 h-10 px-3 rounded-2xl text-sm font-medium text-ink-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 opacity-70" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-card"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-60 bg-white border-r border-line flex flex-col
          transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
