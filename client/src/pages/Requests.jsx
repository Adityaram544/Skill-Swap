import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRequests, updateRequestStatus } from '../services/requestService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import RequestCard from '../components/RequestCard';
import { Inbox, Loader2 } from 'lucide-react';

const tabs = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'sent', label: 'Sent by Me' }
];

const Requests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getUserRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateRequestStatus(id, status);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const isSender = r.senderId?._id?.toString() === user?._id?.toString();
    if (activeTab === 'pending') return r.status === 'Pending';
    if (activeTab === 'accepted') return r.status === 'Accepted';
    if (activeTab === 'rejected') return r.status === 'Rejected' || r.status === 'Cancelled';
    if (activeTab === 'sent') return isSender;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] dark:bg-[#0b1329]">
      <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 w-full flex">

        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          pendingCount={requests.filter((r) => r.status === 'Pending' && r.receiverId?._id?.toString() === user?._id?.toString()).length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto space-y-6">
          
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              Skill Swap Proposals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage incoming and outgoing skill exchange offers with peers.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
              <span className="text-xs">Fetching swap requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No requests found under "{activeTab}" tab.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Explore skills and send proposals to find new swap partners!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map((req) => (
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

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Requests;
