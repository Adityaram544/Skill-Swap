import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Sparkles, Users, MessageSquare, ShieldCheck, ArrowRight, Code, Globe, Layout, Music, TrendingUp, Utensils, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Landing = () => {
  const categories = [
    { name: 'Technology & Code', icon: Code, count: '140+ skills', color: 'from-cyan-500 to-brand-600' },
    { name: 'Languages & Speech', icon: Globe, count: '85+ languages', color: 'from-emerald-500 to-teal-600' },
    { name: 'UI/UX & Design', icon: Layout, count: '60+ topics', color: 'from-coral-500 to-amber-600' },
    { name: 'Music & Instruments', icon: Music, count: '45+ instruments', color: 'from-amber-500 to-coral-600' },
    { name: 'Business & Growth', icon: TrendingUp, count: '90+ strategies', color: 'from-sky-500 to-brand-600' },
    { name: 'Culinary & Baking', icon: Utensils, count: '50+ recipes', color: 'from-coral-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4" />
            <span>The #1 Peer-to-Peer Skill Exchange Network</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
            Teach What You Know.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-cyan-500 to-teal-400 dark:from-brand-400 dark:via-cyan-400 dark:to-teal-300">
              Learn What You Love.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Trade skills directly with passionate peers across coding, languages, design, music, and business. No subscription fees — just mutual 1-on-1 growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="btn-connect w-full sm:w-auto !px-8 !py-4 !text-base !rounded-2xl"
            >
              <span>Start Swapping Skills</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="btn-message w-full sm:w-auto !px-8 !py-4 !text-base !rounded-2xl"
            >
              Log In to Account
            </Link>
          </div>

          {/* Social Proof stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
            <div>
              <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Free Peer Exchange</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Smart</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bidirectional Match Engine</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Real-Time</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Socket.io Messaging</p>
            </div>
            <div>
              <p className="font-display font-extrabold text-3xl text-slate-900 dark:text-white">Verified</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skill Experience Levels</p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3">
              How SkillSwap Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Three simple steps to start exchanging knowledge with mentors & learners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                1. Build Your Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                List the skills you can teach and the topics you want to master along with your experience levels.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Repeat className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                2. Match & Propose
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Our match engine highlights users where User A teaches what User B wants, and vice versa.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
                3. Chat & Exchange
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Connect in real-time chat, schedule sessions, and enjoy mutual peer learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Explore Popular Skill Categories
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Discover thousands of active skill opportunities waiting for you.
              </p>
            </div>
            <Link
              to="/signup"
              className="mt-4 md:mt-0 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <span>Join to browse all skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="glass-card p-6 rounded-3xl flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
