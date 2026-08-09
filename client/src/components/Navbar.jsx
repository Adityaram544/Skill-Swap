import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import {
  Sun,
  Moon,
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  Repeat,
  Menu,
  X,
  MessageSquare
} from 'lucide-react';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, clearNotifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Mobile Sidebar Trigger */}
          <div className="flex items-center space-x-3">
            {user && (
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold transition-transform group-hover:scale-105">
                <Repeat className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-600 to-cyan-600 dark:from-white dark:via-brand-400 dark:to-cyan-400 tracking-tight">
                SkillSwap
              </span>
            </Link>
          </div>

          {/* Quick Search trigger (If authenticated) */}
          {user && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <button 
                onClick={() => navigate('/explore')}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-brand-500 transition-all text-left font-medium"
              >
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                <span className="truncate">Search skills like "React", "Spanish", "Design"...</span>
              </button>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Notifications
                        </span>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-400">
                            No unread notifications
                          </div>
                        ) : (
                          notifications.map((n, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setShowNotifications(false);
                                navigate('/chat');
                              }}
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start space-x-3"
                            >
                              <img
                                src={n.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.sender.name}`}
                                alt={n.sender.name}
                                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {n.sender.name} sent a message
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {n.message.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/30"
                    />
                    <span className="hidden sm:inline font-medium text-sm text-slate-700 dark:text-slate-200">
                      {user.name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>View Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn-connect !px-4 !py-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
