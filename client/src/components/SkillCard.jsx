import React from 'react';
import { Award, Code, Globe, Layout, Music, TrendingUp, Utensils, Heart, Server, BarChart } from 'lucide-react';

const categoryColors = {
  Technology: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  Languages: 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30',
  Design: 'bg-coral-500/10 text-coral-600 dark:text-coral-400 border-coral-500/30',
  Music: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Business: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  Cooking: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Fitness: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

const levelBadge = {
  Beginner: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  Intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Expert: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
};

export const SkillBadge = ({ name, category, level, onRemove, type = 'offered' }) => {
  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
      type === 'offered'
        ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/30'
        : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
    }`}>
      <span>{name}</span>
      {level && (
        <span className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${levelBadge[level] || ''}`}>
          {level}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-slate-400 hover:text-rose-500 transition-colors font-bold"
          title="Remove skill"
        >
          ×
        </button>
      )}
    </div>
  );
};

export const SkillCard = ({ skill, onSelect, isOffered, isWanted }) => {
  const catColor = categoryColors[skill.category] || categoryColors.Other;

  return (
    <div className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${catColor}`}>
            {skill.category}
          </span>
          <span className="text-xs text-slate-400 font-mono">Skill</span>
        </div>

        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1.5">
          {skill.name}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {skill.description || 'Master this skill through direct 1-on-1 peer exchange sessions.'}
        </p>
      </div>

      {onSelect && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => onSelect(skill, 'teach')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              isOffered
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white'
            }`}
          >
            {isOffered ? '✓ Teaching' : '+ I Can Teach'}
          </button>
          <button
            onClick={() => onSelect(skill, 'learn')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              isWanted
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white'
            }`}
          >
            {isWanted ? '✓ Learning' : '+ I Want Learn'}
          </button>
        </div>
      )}
    </div>
  );
};
