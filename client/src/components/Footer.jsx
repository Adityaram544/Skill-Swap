import React from 'react';
import { Repeat, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-8 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              <Repeat className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-slate-800 dark:text-slate-200">
              SkillSwap
            </span>
            <span className="text-xs text-slate-400">© 2026 SkillSwap Platform</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
            <span>Learn by Teaching</span>
            <span>•</span>
            <span>100% Free Peer Exchange</span>
            <span>•</span>
            <span>Real-time Chat</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
