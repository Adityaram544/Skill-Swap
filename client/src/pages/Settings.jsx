import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateMyProfile } from '../services/userService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { Sun, Moon, Bell, Shield, Save, CheckCircle, Loader2, Lock, Eye } from 'lucide-react';

const Settings = () => {
  const { user, updateUserState } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(user?.settings?.emailNotifications ?? true);
  const [matchAlerts, setMatchAlerts] = useState(user?.settings?.matchAlerts ?? true);
  const [chatSound, setChatSound] = useState(user?.settings?.chatSound ?? true);
  const [profileVisibility, setProfileVisibility] = useState(user?.settings?.profileVisibility || 'public');

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (user?.settings) {
      setEmailNotifications(user.settings.emailNotifications ?? true);
      setMatchAlerts(user.settings.matchAlerts ?? true);
      setChatSound(user.settings.chatSound ?? true);
      setProfileVisibility(user.settings.profileVisibility || 'public');
    }
  }, [user]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage('');

    try {
      const updatedUser = await updateMyProfile({
        settings: {
          themePreference: theme,
          emailNotifications,
          matchAlerts,
          chatSound,
          profileVisibility
        }
      });
      updateUserState(updatedUser);
      setSavedMessage('Account preferences saved to database successfully!');
      setTimeout(() => setSavedMessage(''), 3500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
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
          
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Account & Preference Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize theme appearance, notification alerts, and account privacy stored in your profile.
            </p>
          </div>

          {savedMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>{savedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Theme Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Sun className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Appearance Theme
                </h2>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Current Mode: {theme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Toggle between dark glassmorphic styling and clean light aesthetics.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Notifications & Alerts
                </h2>
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Match Proposal Notifications
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Notify me when another user sends a swap request.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={matchAlerts}
                    onChange={(e) => setMatchAlerts(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Chat Sounds & Toast Alerts
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Play audio cues and show floating badges when receiving new messages.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatSound}
                    onChange={(e) => setChatSound(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Email Summaries & Updates
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Receive weekly match recommendations via registered email.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                </label>
              </div>
            </div>

            {/* Privacy & Profile Visibility Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Eye className="w-5 h-5 text-coral-500 dark:text-coral-400" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Privacy & Visibility
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Profile Visibility Level
                </label>
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="public">Public (Visible to all users and explore directory)</option>
                  <option value="members">Exchange Members Only (Only matched peers can view profile)</option>
                  <option value="private">Private (Hidden from public search directory)</option>
                </select>
              </div>
            </div>

            {/* Account Info Readonly Card */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Account Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Registered Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Member Since</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-1.5"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;

