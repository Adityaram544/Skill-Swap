import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateMyProfile } from '../services/userService';
import { getSkills, addSkill } from '../services/skillService';
import { createSwapRequest } from '../services/requestService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { UserCard } from '../components/UserCard';
import { SkillCard } from '../components/SkillCard';
import Modal from '../components/Modal';
import { Search, Filter, Plus, Loader2, Sparkles, CheckCircle } from 'lucide-react';

const categories = ['All', 'Technology', 'Languages', 'Design', 'Music', 'Business', 'Cooking', 'Fitness', 'Other'];

const ExploreSkills = () => {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'catalog'
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Proposal Modal State
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState(null);
  const [customOfferedName, setCustomOfferedName] = useState('');
  const [requestedSkill, setRequestedSkill] = useState(null);
  const [proposalMessage, setProposalMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  // Add Custom Skill Modal State
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technology');
  const [newSkillDescription, setNewSkillDescription] = useState('');

  const loadExploreData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const [usersData, skillsData] = await Promise.all([
        getAllUsers(params),
        getSkills(params)
      ]);

      // Filter out logged in user from explore users list
      setUsers(usersData.filter((u) => u._id.toString() !== user?._id?.toString()));
      setSkills(skillsData);
    } catch (err) {
      console.error('Failed to fetch explore data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExploreData();
  }, [searchQuery, selectedCategory]);

  const openSwapModal = (targetUser) => {
    setSelectedTargetUser(targetUser);
    setCustomOfferedName('');
    if (user?.skillsOffered && user.skillsOffered.length > 0) {
      setOfferedSkill(user.skillsOffered[0]);
    } else {
      setOfferedSkill(null);
    }
    setRequestedSkill(targetUser?.skillsOffered?.[0] || null);
    setProposalMessage(`Hi ${targetUser.name}, I'd love to swap skills with you!`);
    setRequestSuccess('');
  };

  const handleSendSwapProposal = async (e) => {
    e.preventDefault();
    if (!selectedTargetUser) return;

    let skillToOffer = offeredSkill;

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
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send swap proposal');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleToggleProfileSkill = async (skill, type) => {
    if (!user) return;
    const isOffered = type === 'teach';

    let currentArray = isOffered ? [...(user.skillsOffered || [])] : [...(user.skillsWanted || [])];
    const existsIndex = currentArray.findIndex((s) => s.name.toLowerCase().trim() === skill.name.toLowerCase().trim());

    if (existsIndex >= 0) {
      currentArray.splice(existsIndex, 1);
    } else {
      currentArray.push({
        name: skill.name,
        category: skill.category,
        level: 'Intermediate',
        description: skill.description || ''
      });
    }

    const payload = isOffered
      ? { skillsOffered: currentArray }
      : { skillsWanted: currentArray };

    try {
      const updatedUser = await updateMyProfile(payload);
      updateUserState(updatedUser);
    } catch (err) {
      console.error('Failed to update skill on profile:', err);
    }
  };


  const handleCreateNewSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      await addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        description: newSkillDescription
      });
      setIsAddSkillModalOpen(false);
      setNewSkillName('');
      setNewSkillDescription('');
      loadExploreData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add custom skill');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] dark:bg-[#0b1329]">
      <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 w-full flex">

        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto space-y-6">
          
          {/* Discovery Hero Header */}
          <div className="p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 dark:from-teal-950/40 dark:via-cyan-950/40 dark:to-slate-900 border border-teal-500/20 dark:border-teal-500/30 shadow-sm">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3 border border-teal-500/20">
                <Sparkles className="w-3.5 h-3.5 text-coral-500" />
                <span>Peer-to-Peer Skill Discovery Platform</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-1.5">
                Find your next skill partner
              </h1>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-5 font-medium">
                Learn something new. Share what you know.
              </p>

              {/* Hero Search Bar */}
              <div className="relative w-full">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 absolute left-4 top-3.5 font-bold" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, topics (e.g., 'React', 'Spanish', 'UI/UX'), or mentor names..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm sm:text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 dark:focus:border-teal-400 shadow-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Controls Bar & View Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* View Selector Pills */}
            <div className="flex bg-slate-200/80 dark:bg-slate-900/80 p-1.5 rounded-2xl w-full sm:w-auto border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'users'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Peer Partners ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 sm:flex-none px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Skill Catalog ({skills.length})
              </button>
            </div>

            <button
              onClick={() => setIsAddSkillModalOpen(true)}
              className="btn-connect self-stretch sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Skill</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Content Body */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
              <span className="text-xs">Loading available skills and peer profiles...</span>
            </div>
          ) : activeTab === 'users' ? (
            users.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 text-sm font-medium">
                No users found.
              </div>
            ) : (



              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                  <UserCard
                    key={u._id}
                    user={u}
                    onRequestSwap={openSwapModal}
                    onMessage={() => navigate('/chat')}
                  />
                ))}
              </div>
            )
          ) : (
            skills.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 text-sm">
                No skills found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {skills.map((skill) => {
                  const isOffered = user?.skillsOffered?.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
                  const isWanted = user?.skillsWanted?.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
                  return (
                    <SkillCard
                      key={skill._id}
                      skill={skill}
                      onSelect={handleToggleProfileSkill}
                      isOffered={isOffered}
                      isWanted={isWanted}
                    />
                  );
                })}
              </div>
            )
          )}

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
                  {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Proposal</span>}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Add Custom Skill Modal */}
      <Modal
        isOpen={isAddSkillModalOpen}
        onClose={() => setIsAddSkillModalOpen(false)}
        title="Add New Custom Skill to Index"
      >
        <form onSubmit={handleCreateNewSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Skill Name
            </label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Flutter Development, Japanese, Origami"
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            >
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={newSkillDescription}
              onChange={(e) => setNewSkillDescription(e.target.value)}
              placeholder="Brief description of what learners will study..."
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddSkillModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-xl"
            >
              Create Skill
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
};

export default ExploreSkills;
