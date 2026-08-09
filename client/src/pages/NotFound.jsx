import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
        <Repeat className="w-8 h-8" />
      </div>
      <h1 className="font-display font-extrabold text-6xl text-slate-900 dark:text-white mb-2">404</h1>
      <h2 className="font-display font-bold text-2xl text-slate-800 dark:text-slate-200 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/dashboard"
        className="btn-connect"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
