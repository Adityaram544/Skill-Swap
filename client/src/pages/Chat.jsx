import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSearchParams } from 'react-router-dom';
import { getRecentConversations, deleteContactAPI } from '../services/chatService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import {
  Search, Loader2, MessageSquare, Trash2, X,
  AlertTriangle, UserMinus, Sparkles
} from 'lucide-react';

// Delete Confirmation Modal (Theme Aware)
const DeleteContactModal = ({ contact, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/15 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Delete Chat History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
        Delete conversation with{' '}
        <span className="font-bold text-slate-900 dark:text-white">{contact?.name}</span>?
        This removes the chat history for your view.
      </p>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="btn-reject flex-1"
        >
          Delete Chat
        </button>
      </div>
    </div>
  </div>
);

const Chat = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchContact, setSearchContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showChatList, setShowChatList] = useState(true); // mobile view toggle
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [hoveredContact, setHoveredContact] = useState(null);

  const fetchConversations = async () => {
    try {
      const list = await getRecentConversations();
      setConversations(list);
      const targetUserId = searchParams.get('userId');
      if (targetUserId) {
        const found = list.find((item) => item.user._id.toString() === targetUserId);
        if (found) {
          setSelectedUser(found.user);
          setShowChatList(false);
        }
      } else if (list.length > 0 && !selectedUser) {
        setSelectedUser(list[0].user);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [searchParams]);

  const handleSelectContact = (contactUser) => {
    setSelectedUser(contactUser);
    setShowChatList(false);
  };

  const handleDeleteContact = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContactAPI(deleteTarget._id);
      setConversations((prev) => prev.filter((c) => c.user._id !== deleteTarget._id));
      if (selectedUser?._id === deleteTarget._id) {
        setSelectedUser(null);
        setShowChatList(true);
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredConversations = conversations.filter((item) =>
    item.user.name.toLowerCase().includes(searchContact.toLowerCase())
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#070a12] text-slate-900 dark:text-slate-100 overflow-hidden pb-16 lg:pb-0">
      <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteContactModal
          contact={deleteTarget}
          onConfirm={handleDeleteContact}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex-1 flex min-h-0 w-full overflow-hidden">
        {/* App Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
        />

        {/* Chat Layout — Full height glass panel container */}
        <div className="flex-1 flex min-h-0 min-w-0 my-2 mr-2 ml-2 lg:ml-0 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl overflow-hidden shadow-xl">

          {/* ── Conversations List Left Panel ── */}
          <div className={`
            flex-shrink-0 flex flex-col bg-white/80 dark:bg-slate-900/80 border-r border-slate-200/80 dark:border-slate-800/80
            w-full md:w-[320px] lg:w-[360px]
            ${showChatList ? 'flex' : 'hidden md:flex'}
          `}>

            {/* Panel Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Messages</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {conversations.length} Active
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  placeholder="Search partner conversations..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                  <span className="text-xs text-slate-400">Loading messages...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No conversations yet</p>
                  <p className="text-xs text-slate-400">Accept a swap proposal in Swap Requests to open direct chat!</p>
                </div>
              ) : (
                filteredConversations.map((item) => {
                  const isSelected = selectedUser?._id === item.user._id;
                  const isOnline = onlineUsers.includes(item.user._id.toString());
                  const isHovered = hoveredContact === item.user._id;

                  return (
                    <div
                      key={item.user._id}
                      onMouseEnter={() => setHoveredContact(item.user._id)}
                      onMouseLeave={() => setHoveredContact(null)}
                      onClick={() => handleSelectContact(item.user)}
                      className={`
                        relative flex items-center space-x-3 px-3.5 py-3 rounded-2xl cursor-pointer transition-all duration-200
                        ${isSelected
                          ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 font-medium'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user.name}`}
                          alt={item.user.name}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white/20"
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${isOnline ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {item.user.name}
                          </span>
                          {item.lastMessageTime && (
                            <span className={`text-[10px] flex-shrink-0 ml-1 ${isSelected ? 'text-brand-100' : 'text-slate-400'}`}>
                              {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.lastMessage || (isOnline ? '● Online now' : 'Tap to start chatting')}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {item.unreadCount > 0 && !isSelected && (
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm">
                          {item.unreadCount}
                        </span>
                      )}

                      {/* Delete button on hover */}
                      {isHovered && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(item.user);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-xl text-slate-500 dark:text-slate-400 transition-all shadow-xs"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Active Conversation Right Panel ── */}
          <div className={`
            flex-1 flex flex-col min-w-0 min-h-0 bg-white/60 dark:bg-slate-900/60
            ${!showChatList ? 'flex' : 'hidden md:flex'}
          `}>
            {/* Mobile back button */}
            {!showChatList && selectedUser && (
              <div className="md:hidden flex items-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <button
                  onClick={() => setShowChatList(true)}
                  className="flex items-center space-x-2 text-brand-600 dark:text-cyan-400 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                  <span>Back to Conversations List</span>
                </button>
              </div>
            )}

            <ChatWindow targetUser={selectedUser} currentUserId={user?._id} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;

