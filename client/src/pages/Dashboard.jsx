import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatches } from '../services/matchService';
import { getUserRequests, createSwapRequest, updateRequestStatus } from '../services/requestService';
import { updateMyProfile } from '../services/userService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { MatchCard } from '../components/UserCard';
import RequestCard from '../components/RequestCard';
import Modal from '../components/Modal';
import { SkillBadge } from '../components/SkillCard';
import {
  Sparkles,
  Inbox,
  Repeat,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Proposal modal state
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState(null);
  const [customOfferedName, setCustomOfferedName] = useState('');
  const [requestedSkill, setRequestedSkill] = useState(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  const loadDashboardData = async () => {
    try {
      const [matchRes, reqRes] = await Promise.all([
        getMatches(),
        getUserRequests()
      ]);
      // Deduplicate matches by user._id (a user may appear multiple times if they match on multiple skills)
      const seen = new Set();
      const uniqueMatches = matchRes.filter((m) => {
        const uid = m.user._id.toString();
        if (seen.has(uid)) return false;
        seen.add(uid);
        return true;
      });
      setMatches(uniqueMatches);
      setRequests(reqRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.skillsOffered, user?.skillsWanted]);

  const pendingRequests = requests.filter(
    (r) => r.status === 'Pending' && r.receiverId?._id?.toString() === user?._id?.toString()
  );
  const activeSwaps = requests.filter((r) => r.status === 'Accepted');

  const openSwapModal = (targetUser) => {
    setSelectedTargetUser(targetUser);
    setCustomOfferedName('');
    if (user?.skillsOffered && user.skillsOffered.length > 0) {
      setOfferedSkill(user.skillsOffered[0]);
    } else {
      setOfferedSkill(null);
    }
    setRequestedSkill(targetUser.skillsOffered?.[0] || null);
    setProposalMessage(`Hi ${targetUser.name}, I'd love to swap skills with you!`);
    setRequestSuccess('');
  };

  const handleSendSwapProposal = async (e) => {
    e.preventDefault();
    if (!selectedTargetUser) return;

    let skillToOffer = offeredSkill;

    // If user has no pre-saved offered skills, auto-add custom skill to profile
    if (!skillToOffer && customOfferedName.trim()) {
      const newSkill = {
        name: customOfferedName.trim(),
        category: 'Technology',
        level: 'Intermediate'
      };
      const updatedOffered = [...(user?.skillsOffered || []), newSkill];
      try {
        const updatedUser = await updateMyProfile({ skillsOffered: updatedOffered });
        updateUserState(updatedUser);
        skillToOffer = newSkill;
      } catch (err) {
        console.error('Failed to quick-add skill:', err);
      }
    }

    if (!skillToOffer || !requestedSkill) return;

    setSubmittingRequest(true);
    try {
      await createSwapRequest({
        receiverId: selectedTargetUser._id,
        offeredSkill: skillToOffer,
        requestedSkill,
        message: proposalMessage
      });

      setRequestSuccess(`Swap proposal sent successfully to ${selectedTargetUser.name}!`);
      setTimeout(() => {
        setSelectedTargetUser(null);
        loadDashboardData();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateRequestStatus(id, status);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const hasOfferedSkills = user?.skillsOffered && user.skillsOffered.length > 0;
  const hasWantedSkills = user?.skillsWanted && user.skillsWanted.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] dark:bg-[#0b1329]">
      <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 w-full flex">

        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          pendingCount={pendingRequests.length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto space-y-8">
          
          {/* Hero Welcome Header */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-cyan-600 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3 border border-white/20 text-cyan-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Peer Skill Network</span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-4xl mb-2 tracking-tight">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-brand-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                  Discover <span className="font-extrabold text-white">{matches.length} matched peers</span> ready to swap skills, with{' '}
                  <span className="font-extrabold text-white">{pendingRequests.length} pending exchange proposals</span>.
                </p>
              </div>

              <div className="flex items-center space-x-3 self-start md:self-auto">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                    alt={user?.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Skill Status Prompt Banner if skills are empty */}
          {(!hasOfferedSkills || !hasWantedSkills) && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-amber-300">
                    Complete your skill profile to unlock 1-on-1 partner matching!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {!hasOfferedSkills && !hasWantedSkills
                      ? 'You have not listed any skills to teach or learn.'
                      : !hasOfferedSkills
                      ? 'Add skills you can teach so peers can request a swap with you.'
                      : 'Add skills you want to learn so our engine can find perfect mentors.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md whitespace-nowrap self-stretch sm:self-auto text-center transition-all"
              >
                Add Skills to Profile
              </button>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="glass-card p-5 rounded-3xl flex items-center space-x-4 border border-brand-500/20">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  {matches.length}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Matched Partners</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl flex items-center space-x-4 border border-amber-500/20">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  {pendingRequests.length}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Proposals</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl flex items-center space-x-4 border border-emerald-500/20">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  {activeSwaps.length}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Swaps</p>
              </div>
            </div>
          </div>

          {/* Three Core Questions Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-3xl border-l-4 border-l-brand-600">
              <span className="text-[10px] font-bold text-brand-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                Mentorship
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                Who can I learn from?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore experts offering skills in your wishlist.
              </p>
            </div>

            <div className="glass-card p-5 rounded-3xl border-l-4 border-l-teal-500">
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
                Teaching
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                Who can learn from me?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share your expertise with eager peer learners.
              </p>
            </div>

            <div className="glass-card p-5 rounded-3xl border-l-4 border-l-cyan-500">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                Connections
              </span>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
                Who should I connect with?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Highest percentage mutual match recommendation.
              </p>
            </div>
          </div>

          {/* Pending Swap Requests Section */}
          {pendingRequests.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Inbox className="w-5 h-5 text-amber-500" />
                  <span>Pending Requests ({pendingRequests.length})</span>
                </h2>
                <button
                  onClick={() => navigate('/requests')}
                  className="text-xs font-bold text-brand-600 dark:text-cyan-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingRequests.slice(0, 2).map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    currentUserId={user?._id}
                    onUpdateStatus={handleUpdateStatus}
                    onStartChat={(otherUser) => navigate(`/chat?userId=${otherUser._id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recommended Matches Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-brand-600 dark:text-cyan-400" />
                  <span>Recommended Partners For You</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated based on your active teaching & learning preferences.
                </p>
              </div>

              <button
                onClick={() => navigate('/explore')}
                className="text-xs font-bold text-brand-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Explore All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
                <span className="text-xs">Calculating optimal partner matches...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-panel p-8 rounded-3xl text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No match recommendations yet!
                </p>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  Add more skills to your profile to let our match engine find complementary exchange partners.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn-connect"
                >
                  Update Profile Skills
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {matches.slice(0, 4).map((match) => (
                  <MatchCard
                    key={match.user._id}
                    match={match}
                    onRequestSwap={openSwapModal}
                    onMessage={(target) => navigate(`/chat?userId=${target._id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Active Skill Swaps Section */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Repeat className="w-5 h-5 text-emerald-500" />
              <span>Active Skill Swaps ({activeSwaps.length})</span>
            </h2>

            {activeSwaps.length === 0 ? (
              <div className="glass-card p-6 rounded-2xl text-center text-xs text-slate-400">
                You don't have any accepted skill swaps yet. Send a request to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeSwaps.map((req) => (
                  <RequestCard
                    key={req._id}
                    request={req}
                    currentUserId={user?._id}
                    onUpdateStatus={handleUpdateStatus}
                    onStartChat={(otherUser) => navigate(`/chat?userId=${otherUser._id}`)}
                  />
                ))}
              </div>
            )}
          </section>

        </main>
      </div>

      {/* Propose Swap Modal */}
      {selectedTargetUser && (
        <Modal
          isOpen={!!selectedTargetUser}
          onClose={() => setSelectedTargetUser(null)}
          title={`Propose Skill Swap with ${selectedTargetUser.name}`}
        >
          {requestSuccess ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{requestSuccess}</p>
            </div>
          ) : (
            <form onSubmit={handleSendSwapProposal} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Skill You Will Teach ({user?.name})
                </label>

                {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                  <select
                    value={offeredSkill ? JSON.stringify(offeredSkill) : ''}
                    onChange={(e) => setOfferedSkill(JSON.parse(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {user.skillsOffered.map((s, idx) => (
                      <option key={idx} value={JSON.stringify(s)}>
                        {s.name} ({s.level || 'Intermediate'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={customOfferedName}
                      onChange={(e) => setCustomOfferedName(e.target.value)}
                      placeholder="Enter skill you can teach (e.g. React, Spanish, Piano)..."
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                    <p className="text-[11px] text-amber-500">
                      You have no offered skills listed on your profile. Typing a skill above will automatically add it to your profile!
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Skill You Want From {selectedTargetUser.name}
                </label>
                {selectedTargetUser.skillsOffered && selectedTargetUser.skillsOffered.length > 0 ? (
                  <select
                    value={requestedSkill ? JSON.stringify(requestedSkill) : ''}
                    onChange={(e) => setRequestedSkill(JSON.parse(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  >
                    {selectedTargetUser.skillsOffered.map((s, idx) => (
                      <option key={idx} value={JSON.stringify(s)}>
                        {s.name} ({s.level || 'Intermediate'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400">Target user has no specific skills listed.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Proposal Note
                </label>
                <textarea
                  rows={3}
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  placeholder="Introduce yourself and outline your proposed learning schedule..."
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTargetUser(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingRequest || (!offeredSkill && !customOfferedName.trim()) || !requestedSkill}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5"
                >
                  {submittingRequest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Proposal</span>
                  )}
                </button>
              </div>

            </form>
          )}
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;

