import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, uploadAvatar } from '../services/userService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { SkillBadge } from '../components/SkillCard';
import Modal from '../components/Modal';
import {
  User,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Save,
  Loader2,
  Award,
  CheckCircle,
  AlertCircle,
  Upload,
  Sparkles,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

const categoriesList = ['Technology', 'Languages', 'Design', 'Music', 'Business', 'Cooking', 'Fitness', 'Other'];
const levelsList = ['Beginner', 'Intermediate', 'Expert'];
const userExperienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const AVAILABILITY_OPTIONS = ['Weekdays', 'Weekends', 'Morning', 'Afternoon', 'Evening', 'Night', 'Flexible'];


const AVATAR_PRESETS = [
  {
    name: 'Avatar 1',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6BMObIiVoLUe6QWiEm-15Tc2jbYqV8eu_gxgawBxNpw&s=10'
  },
  {
    name: 'Avatar 2',
    url: 'https://thumbs.dreamstime.com/b/anime-cartoon-character-male-vector-art-illustration-stylish-expressive-design-has-sharp-style-hair-bold-facial-384511590.jpg'
  },
  {
    name: 'Avatar 3',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2k89kexN2ddGtOJ5Wno8pjHmIRCnjKetdChK7qtVq-w&s=10'
  },
  {
    name: 'Avatar 4',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTocUvluyH5QiaP8jRkOnuWQK2UjHrfWxDttsvUaoTEXQ&s=10'
  },
  {
    name: 'Avatar 5',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvfRH28cPD8_N88PYb7f80SAv_7WEpUi-DLLK6RZHYAA&s'
  },
  {
    name: 'Avatar 6',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbHGreXybrNkZAoSGjNBfmZLTsIRYVEJMJYeeyIr7zyg&s=10'
  },
  {
    name: 'Avatar 7',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrR4dOwyViJdPVp3bPO1xPC35pYsd-2nf5L3_duGAGUQ&s=10'
  },
  {
    name: 'Avatar 8',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR37mhN_GFahRoVhGtKXQLZEvR5nE3xG4v-cbM0f0pQ1g&s=10'
  },
  {
    name: 'Avatar 9',
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyDI5AdPmBHz_SmLZvsG3LWTpu-L3msaQNSF1-K_eoPQ&s=10'
  },
  {
    name: 'Avatar 10',
    url: 'https://i.pinimg.com/1200x/fa/d5/e7/fad5e79954583ad50ccb3f16ee64f66d.jpg'
  }

];

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [availability, setAvailability] = useState(user?.availability || 'Flexible');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Intermediate');

  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsWanted, setSkillsWanted] = useState(user?.skillsWanted || []);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fileInputRef = useRef(null);

  // Synchronize form state with AuthContext user whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatar(user.avatar || '');
      setAvailability(user.availability || 'Flexible');
      setExperienceLevel(user.experienceLevel || 'Intermediate');
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const updated = await updateMyProfile({
        name,
        bio,
        location,
        avatar,
        availability,
        experienceLevel,
        skillsOffered,
        skillsWanted
      });
      updateUserState(updated);
      showToast('Profile and skills updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Image File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setAvatar(base64Data);

      try {
        const res = await uploadAvatar({ image: base64Data });
        if (res.user) {
          updateUserState(res.user);
        }
        showToast('Profile picture uploaded successfully!', 'success');
      } catch (err) {
        showToast('Failed to upload picture', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Skill Modal State
  const [skillModalType, setSkillModalType] = useState(null); // 'offered' or 'wanted'
  const [modalSkillName, setModalSkillName] = useState('');
  const [modalSkillCategory, setModalSkillCategory] = useState('Technology');
  const [modalSkillLevel, setModalSkillLevel] = useState('Intermediate');
  const [modalSkillDesc, setModalSkillDesc] = useState('');
  const [modalError, setModalError] = useState('');

  // Edit Skill Modal State
  const [editSkillModal, setEditSkillModal] = useState(null); // { type: 'offered'|'wanted', index: number, skill: {} }
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillCategory, setEditSkillCategory] = useState('Technology');
  const [editSkillLevel, setEditSkillLevel] = useState('Intermediate');
  const [editSkillDesc, setEditSkillDesc] = useState('');
  const [editSkillError, setEditSkillError] = useState('');

  const handleAddSkillToProfile = async (e) => {
    e.preventDefault();
    setModalError('');

    const trimmedName = modalSkillName.trim();
    if (!trimmedName) {
      setModalError('Please enter a valid skill name.');
      return;
    }

    const targetList = skillModalType === 'offered' ? skillsOffered : skillsWanted;
    const isDuplicate = targetList.some(
      (s) => s.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setModalError(`Skill "${trimmedName}" is already added to your ${skillModalType === 'offered' ? 'teaching' : 'learning'} skills.`);
      return;
    }

    const newSkillItem = {
      name: trimmedName,
      category: modalSkillCategory,
      level: modalSkillLevel,
      description: modalSkillDesc.trim()
    };

    const newOffered = skillModalType === 'offered' ? [...skillsOffered, newSkillItem] : skillsOffered;
    const newWanted = skillModalType === 'wanted' ? [...skillsWanted, newSkillItem] : skillsWanted;

    setSkillsOffered(newOffered);
    setSkillsWanted(newWanted);
    setSkillModalType(null);
    setModalSkillName('');
    setModalSkillDesc('');

    // Persist immediately to backend & state
    try {
      const updated = await updateMyProfile({
        skillsOffered: newOffered,
        skillsWanted: newWanted
      });
      updateUserState(updated);
      showToast(`Added skill "${trimmedName}" successfully!`, 'success');
    } catch (err) {
      showToast('Skill added locally. Click "Save Profile & Skills" to persist.', 'info');
    }
  };

  const handleRemoveSkill = async (index, type) => {
    let newOffered = [...skillsOffered];
    let newWanted = [...skillsWanted];

    if (type === 'offered') {
      newOffered.splice(index, 1);
      setSkillsOffered(newOffered);
    } else {
      newWanted.splice(index, 1);
      setSkillsWanted(newWanted);
    }

    try {
      const updated = await updateMyProfile({
        skillsOffered: newOffered,
        skillsWanted: newWanted
      });
      updateUserState(updated);
      showToast('Skill removed successfully!', 'success');
    } catch (err) {
      showToast('Skill removed locally. Save to apply.', 'info');
    }
  };

  const openEditSkill = (index, type) => {
    const list = type === 'offered' ? skillsOffered : skillsWanted;
    const skill = list[index];
    setEditSkillModal({ type, index });
    setEditSkillName(skill.name);
    setEditSkillCategory(skill.category || 'Technology');
    setEditSkillLevel(skill.level || 'Intermediate');
    setEditSkillDesc(skill.description || '');
    setEditSkillError('');
  };

  const handleEditSkillSave = async (e) => {
    e.preventDefault();
    setEditSkillError('');
    const trimmedName = editSkillName.trim();
    if (!trimmedName) {
      setEditSkillError('Please enter a skill name.');
      return;
    }

    const { type, index } = editSkillModal;
    const list = type === 'offered' ? [...skillsOffered] : [...skillsWanted];
    list[index] = {
      ...list[index],
      name: trimmedName,
      category: editSkillCategory,
      level: editSkillLevel,
      description: editSkillDesc.trim()
    };

    const newOffered = type === 'offered' ? list : skillsOffered;
    const newWanted = type === 'wanted' ? list : skillsWanted;

    if (type === 'offered') setSkillsOffered(newOffered);
    else setSkillsWanted(newWanted);

    setEditSkillModal(null);

    try {
      const updated = await updateMyProfile({ skillsOffered: newOffered, skillsWanted: newWanted });
      updateUserState(updated);
      showToast(`Skill "${trimmedName}" updated!`, 'success');
    } catch (err) {
      showToast('Skill updated locally. Click Save to persist.', 'info');
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                My Professional Swap Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Customize your public bio, avatar, availability, taught skills, and learning goals.
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="btn-connect self-start sm:self-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile & Skills</span>
            </button>
          </div>

          {/* Social Stats Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl text-center border border-brand-500/20">
              <span className="text-xl font-display font-extrabold text-brand-600 dark:text-cyan-400">
                {skillsOffered.length}
              </span>
              <span className="block text-[11px] font-bold text-slate-500 uppercase mt-0.5">Skills Taught</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-teal-500/20">
              <span className="text-xl font-display font-extrabold text-teal-600 dark:text-teal-400">
                {skillsWanted.length}
              </span>
              <span className="block text-[11px] font-bold text-slate-500 uppercase mt-0.5">Learning Goals</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-emerald-500/20">
              <span className="text-xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                98%
              </span>
              <span className="block text-[11px] font-bold text-slate-500 uppercase mt-0.5">Match Score</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center border border-amber-500/20">
              <span className="text-xl font-display font-extrabold text-amber-600 dark:text-amber-400">
                5.0 ★
              </span>
              <span className="block text-[11px] font-bold text-slate-500 uppercase mt-0.5">Peer Rating</span>
            </div>
          </div>

          {toast.message && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in ${toast.type === 'error'
                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
            >
              {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{toast.message}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-8">

            {/* Profile Avatar & Picture Selector */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                <Camera className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>Profile Picture & Avatar Gallery</span>
              </h2>

              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">

                {/* Active Image Display */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative group">
                    <img
                      src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                      alt={name}
                      className="w-28 h-28 rounded-3xl object-cover ring-4 ring-brand-500/30 shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Upload new image"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-brand-600/10 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Device Photo</span>
                  </button>
                </div>

                {/* Avatar Gallery Picker */}
                <div className="flex-1 w-full space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Or Select A Modern Avatar Preset
                  </label>

                  <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(preset.url)}
                        className={`relative rounded-2xl p-1 overflow-hidden transition-all transform hover:scale-105 ${avatar === preset.url
                          ? 'ring-2 ring-brand-500 bg-brand-500/10'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-10 h-10 rounded-xl object-cover mx-auto" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Direct Image / Avatar URL:
                    </label>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* General Info Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>General Profile Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Overall Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                  >
                    {userExperienceLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div>

                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Availability Schedule Options
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {AVAILABILITY_OPTIONS.map((opt) => {
                      const currentArr = Array.isArray(availability)
                        ? availability
                        : typeof availability === 'string'
                          ? availability.split(',').map((s) => s.trim())
                          : ['Flexible'];
                      const isSelected = currentArr.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            let updated = [...currentArr];
                            if (isSelected) {
                              updated = updated.filter((x) => x !== opt);
                            } else {
                              updated.push(opt);
                            }
                            if (updated.length === 0) updated = ['Flexible'];
                            setAvailability(updated);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                            }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Bio / Learning Philosophy
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential exchange partners about your background and interests..."
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Skills Offered (Can Teach) Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    <span>Skills I Can Teach ({skillsOffered.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Topics and skills you are ready to mentor others in.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSkillModalType('offered');
                    setModalError('');
                  }}
                  className="px-3.5 py-2 bg-brand-600/10 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill to Teach</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {skillsOffered.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills listed yet. Click button above to add!</p>
                ) : (
                  skillsOffered.map((skill, idx) => (
                    <div key={idx} className="group relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => openEditSkill(idx, 'offered')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all text-xs font-semibold group-hover:pr-7"
                        title="Click to edit skill"
                      >
                        <span>{skill.name}</span>
                        <span className="opacity-60 font-normal text-[10px]">{skill.level}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx, 'offered')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center transition-opacity"
                        title="Delete skill"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skills Wanted (Want to Learn) Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>Skills I Want to Learn ({skillsWanted.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Topics you are looking to study with a mentor.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSkillModalType('wanted');
                    setModalError('');
                  }}
                  className="px-3.5 py-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill to Learn</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {skillsWanted.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No learning skills listed yet. Click button above to add!</p>
                ) : (
                  skillsWanted.map((skill, idx) => (
                    <div key={idx} className="group relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => openEditSkill(idx, 'wanted')}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all text-xs font-semibold group-hover:pr-7"
                        title="Click to edit skill"
                      >
                        <span>{skill.name}</span>
                        <span className="opacity-60 font-normal text-[10px]">{skill.level}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx, 'wanted')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center transition-opacity"
                        title="Delete skill"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-connect !px-8 !py-3.5 !rounded-2xl"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile & Skills</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </main>
      </div>

      {/* Add Skill to Profile Modal */}
      {skillModalType && (
        <Modal
          isOpen={!!skillModalType}
          onClose={() => setSkillModalType(null)}
          title={`Add Skill (${skillModalType === 'offered' ? 'I Can Teach' : 'I Want to Learn'})`}
        >
          <form onSubmit={handleAddSkillToProfile} className="space-y-4">
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={modalSkillName}
                onChange={(e) => setModalSkillName(e.target.value)}
                placeholder="e.g. React.js, Spanish, Acoustic Guitar"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={modalSkillCategory}
                  onChange={(e) => setModalSkillCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Experience Level
                </label>
                <select
                  value={modalSkillLevel}
                  onChange={(e) => setModalSkillLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {levelsList.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Description / Notes
              </label>
              <textarea
                rows={2}
                value={modalSkillDesc}
                onChange={(e) => setModalSkillDesc(e.target.value)}
                placeholder="Brief summary of your proficiency or goals..."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSkillModalType(null)}
                className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-xl"
              >
                Add Skill
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Skill Modal */}
      {editSkillModal && (
        <Modal
          isOpen={!!editSkillModal}
          onClose={() => setEditSkillModal(null)}
          title={`Edit Skill (${editSkillModal.type === 'offered' ? 'I Can Teach' : 'I Want to Learn'})`}
        >
          <form onSubmit={handleEditSkillSave} className="space-y-4">
            {editSkillError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editSkillError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Skill Name *
              </label>
              <input
                type="text"
                required
                value={editSkillName}
                onChange={(e) => setEditSkillName(e.target.value)}
                placeholder="e.g. React.js, Spanish, Acoustic Guitar"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={editSkillCategory}
                  onChange={(e) => setEditSkillCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {categoriesList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Level
                </label>
                <select
                  value={editSkillLevel}
                  onChange={(e) => setEditSkillLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  {levelsList.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notes (optional)
              </label>
              <textarea
                rows={2}
                value={editSkillDesc}
                onChange={(e) => setEditSkillDesc(e.target.value)}
                placeholder="Brief summary of your proficiency..."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setEditSkillModal(null);
                  handleRemoveSkill(editSkillModal.index, editSkillModal.type);
                }}
                className="px-4 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Skill</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditSkillModal(null)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default Profile;


