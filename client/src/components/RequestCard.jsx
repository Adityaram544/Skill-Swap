import React from 'react';
import { ArrowRight, Check, X, Clock, MessageSquare, Ban, Repeat } from 'lucide-react';
import { SkillBadge } from './SkillCard';

const statusBadge = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Accepted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
  Cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

const RequestCard = ({ request, currentUserId, onUpdateStatus, onStartChat }) => {
  const isSender = request.senderId?._id?.toString() === currentUserId?.toString();
  const otherUser = isSender ? request.receiverId : request.senderId;

  if (!otherUser) return null;

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all pointer-events-none" />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={otherUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`}
              alt={otherUser.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                {otherUser.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isSender ? 'Outgoing proposal' : 'Incoming proposal'}
                {otherUser.availability ? ` • ${Array.isArray(otherUser.availability) ? otherUser.availability.join(', ') : otherUser.availability}` : ''}
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-xs ${statusBadge[request.status]}`}>
            {request.status}
          </span>
        </div>

        {/* Exchange Flow Box: YOU (Skill) ➔ THEY (Skill) */}
        <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 mb-4 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                {isSender ? 'YOU OFFER' : 'THEY OFFER'}
              </span>
              <SkillBadge
                name={request.offeredSkill.name}
                category={request.offeredSkill.category}
                level={request.offeredSkill.level}
                type="offered"
              />
            </div>

            <div className="self-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-brand-600 dark:text-cyan-400">
              <Repeat className="w-4 h-4" />
            </div>

            <div className="flex-1 text-left sm:text-right">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
                {isSender ? 'YOU REQUEST' : 'THEY REQUEST'}
              </span>
              <SkillBadge
                name={request.requestedSkill.name}
                category={request.requestedSkill.category}
                level={request.requestedSkill.level}
                type="wanted"
              />
            </div>
          </div>
        </div>

        {/* Proposal Note */}
        {request.message && (
          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 mb-4">
            "{request.message}"
          </p>
        )}
      </div>

      {/* Action Buttons: Accept -> Green, Reject -> Red, Message -> Cyan */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
        </span>

        <div className="flex items-center space-x-2">
          {!isSender && request.status === 'Pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(request._id, 'Accepted')}
                className="btn-accept !py-1.5 !px-3.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept</span>
              </button>
              <button
                onClick={() => onUpdateStatus(request._id, 'Rejected')}
                className="btn-reject !py-1.5 !px-3.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}

          {isSender && request.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(request._id, 'Cancelled')}
              className="btn-reject !py-1.5 !px-3.5"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Request</span>
            </button>
          )}

          {request.status === 'Accepted' && (
            <button
              onClick={() => onStartChat(otherUser)}
              className="btn-message !py-1.5 !px-4"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;

