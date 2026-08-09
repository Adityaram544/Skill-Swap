import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Inbox,
  MessageSquare,
  User,
  Sparkles,
  Zap
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobileSidebar, pendingCount = 0 }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore Skills', path: '/explore', icon: Compass },
    { label: 'Swap Requests', path: '/requests', icon: Inbox, badge: pendingCount },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
  ];

  const mobileNavItems = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Requests', path: '/requests', icon: Inbox, badge: pendingCount },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-3 justify-between">
      
      {/* Navigation section */}
      <div className="space-y-1.5">
        <div className="px-3 py-1 flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Platform Navigation
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
            <Zap className="w-2.5 h-2.5" /> Active
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 via-brand-600 to-cyan-600 text-white shadow-lg shadow-brand-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3 z-10">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500 dark:group-hover:text-cyan-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full z-10 transition-colors ${
                      isActive ? 'bg-white text-brand-700' : 'bg-amber-500 text-slate-950 shadow-sm'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Modern Skill Exchange Banner */}
      <div className="pt-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/10 via-cyan-500/10 to-transparent border border-brand-500/20 dark:border-brand-500/30 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-brand-500/10 rounded-full blur-xl group-hover:bg-brand-500/20 transition-all" />
          <div className="flex items-center space-x-2 text-brand-600 dark:text-cyan-400 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">Exchange Tip</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Keep your skills updated to receive up to <span className="font-semibold text-brand-600 dark:text-cyan-400">3x more partner matches</span>!
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-[calc(100vh-4.5rem)] sticky top-18 my-2 ml-4 rounded-3xl glass-panel p-2 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={closeMobileSidebar}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-brand-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 w-4 h-1 bg-brand-600 dark:bg-cyan-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;

