import React from 'react';
import { MapPin, Clock, ArrowRightLeft, Sparkles, MessageSquare, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { SkillBadge } from './SkillCard';

const formatAvailability = (avail) => {
  if (!avail) return 'Flexible';
  if (Array.isArray(avail)) return avail.join(', ');
  return avail;
};

export const UserCard = ({ user, onRequestSwap, onMessage }) => {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

      <div>
        {/* User Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/30 group-hover:scale-105 transition-transform duration-300 shadow-md"
            />
            {user.isOnline && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm" title="Online now" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-cyan-400 transition-colors">
                {user.name}
              </h3>
              {user.isVerified && (
                <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.location || 'Remote'}</span>
              </span>
              <span>•</span>
              <span className="btn-teal">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatAvailability(user.availability)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-2 min-h-[2.25rem]">
          {user.bio || 'Passionate skill exchanger looking to share knowledge and learn together.'}
        </p>

        {/* Skills Offered (Deep Electric Blue Chips) */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Can Teach
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsOffered && user.skillsOffered.length > 0 ? (
              user.skillsOffered.map((skill, idx) => (
                <SkillBadge key={idx} name={skill.name} category={skill.category} level={skill.level} type="offered" />
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No teaching skills listed</span>
            )}
          </div>
        </div>

        {/* Skills Wanted (Teal / Cyan Chips) */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Wants to Learn
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsWanted && user.skillsWanted.length > 0 ? (
              user.skillsWanted.map((skill, idx) => (
                <SkillBadge key={idx} name={skill.name} category={skill.category} level={skill.level} type="wanted" />
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No learning skills listed</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Connect -> Blue, Message -> Cyan */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center space-x-2">
        <button
          onClick={() => onRequestSwap(user)}
          className="btn-connect flex-1"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Connect Swap</span>
        </button>

        {onMessage && (
          <button
            onClick={() => onMessage(user)}
            className="btn-message !px-3"
            title="Send Message"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const MatchCard = ({ match, onRequestSwap, onMessage }) => {
  const { user, matchPercentage, isReciprocal, iCanTeachOther, otherCanTeachMe } = match;

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      
      {/* Match % Banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-600 to-cyan-600 text-white font-display font-extrabold text-xs flex items-center space-x-1 shadow-lg shadow-brand-500/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{matchPercentage}% Match</span>
          </div>

          {isReciprocal && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mutual Swap</span>
            </span>
          )}
        </div>
      </div>

      {/* User Info Header */}
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
          alt={user.name}
          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/30 flex-shrink-0 group-hover:scale-105 transition-transform"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
            {user.name}
          </h3>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{user.location || 'Remote'}</span>
            <span>•</span>
            <span className="btn-teal py-0.5">{formatAvailability(user.availability)}</span>
          </div>
        </div>
      </div>

      {/* ALL Skills Offered by this user — matching ones highlighted */}
      {user.skillsOffered && user.skillsOffered.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Can Teach
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsOffered.map((s, idx) => {
              const isMatch = otherCanTeachMe.some((ms) => ms.name === s.name);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    isMatch
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {isMatch && <span className="mr-1 text-emerald-500 font-bold">✓</span>}
                  {s.name}
                  <span className="ml-1.5 opacity-60 text-[10px]">{s.level}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ALL Skills Wanted by this user — matching ones highlighted */}
      {user.skillsWanted && user.skillsWanted.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Wants to Learn
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.skillsWanted.map((s, idx) => {
              const isMatch = iCanTeachOther.some((ms) => ms.name === s.name);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    isMatch
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500/30 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  {isMatch && <span className="mr-1 text-brand-500 font-bold">✓</span>}
                  {s.name}
                  <span className="ml-1.5 opacity-60 text-[10px]">{s.level}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => onRequestSwap(user)}
          className="btn-connect flex-1"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Connect Swap</span>
        </button>

        {onMessage && (
          <button
            onClick={() => onMessage(user)}
            className="btn-message !px-3"
            title="Start Chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

