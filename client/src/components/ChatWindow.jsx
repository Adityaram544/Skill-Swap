import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { getMessagesWithUser, deleteMessageAPI } from '../services/chatService';
import { IncomingCallModal, ActiveCallModal } from './CallModal';
import {
  Send, Smile, PhoneCall, Video, UserCheck,
  ImageIcon, Check, CheckCheck, X, Trash2, Trash, Sparkles, MessageSquare
} from 'lucide-react';

const EMOJI_LIST = ['😊', '👍', '🔥', '🚀', '❤️', '🎉', '💡', '📚', '💻', '🎯', '✨', '🙌', '🤝', '⭐'];

// Context Menu Component (Theme Aware)
const MessageContextMenu = ({ x, y, message, isMe, onClose, onDeleteForMe, onDeleteForEveryone }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const adjustedY = Math.min(y, window.innerHeight - 120);
  const adjustedX = Math.min(x, window.innerWidth - 200);

  return (
    <div
      ref={menuRef}
      style={{ top: adjustedY, left: adjustedX }}
      className="fixed z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1 animate-fade-in"
    >
      <button
        onClick={() => { onDeleteForMe(message); onClose(); }}
        className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Trash className="w-3.5 h-3.5 text-amber-500" />
        <span>Delete for Me</span>
      </button>
      {isMe && (
        <button
          onClick={() => { onDeleteForEveryone(message); onClose(); }}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete for Everyone</span>
        </button>
      )}
    </div>
  );
};

const ChatWindow = ({ targetUser, currentUserId }) => {
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);

  // WebRTC Call State
  const [incomingCall, setIncomingCall] = useState(null); // { from, callId, signal, callType }
  const [callState, setCallState] = useState(null); // { status: 'calling'|'connected', callType: 'voice'|'video', callId: string }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const peerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const isTargetOnline = onlineUsers.includes(targetUser?._id?.toString());

  useEffect(() => {
    if (!targetUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const history = await getMessagesWithUser(targetUser._id);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('join_chat', { targetUserId: targetUser._id });
      socket.emit('mark_read', { senderId: targetUser._id });

      const handleReceiveMessage = (newMsg) => {
        if (
          (newMsg.senderId === targetUser._id && newMsg.receiverId === currentUserId) ||
          (newMsg.senderId === currentUserId && newMsg.receiverId === targetUser._id)
        ) {
          setMessages((prev) => [...prev, newMsg]);
          if (newMsg.senderId === targetUser._id) {
            socket.emit('mark_read', { senderId: targetUser._id });
          }
        }
      };

      const handleMessagesRead = ({ senderId }) => {
        if (senderId === targetUser._id || senderId === currentUserId) {
          setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
        }
      };

      const handleUserTyping = ({ senderId }) => {
        if (senderId === targetUser._id) setIsTyping(true);
      };

      const handleUserStopTyping = ({ senderId }) => {
        if (senderId === targetUser._id) setIsTyping(false);
      };

      const handleMessageDeleted = ({ messageId }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, deletedForEveryone: true, message: '', image: '' }
              : m
          )
        );
      };

      // ── WebRTC Signaling Socket Listeners ──
      const handleIncomingCall = (data) => {
        setIncomingCall(data);
      };

      const handleCallAccepted = async ({ signal, callId }) => {
        if (peerRef.current && signal) {
          try {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal));
            setCallState({ status: 'connected', callType: callState?.callType || 'video', callId });
          } catch (e) {
            console.error('Error setting remote description on answer:', e);
          }
        }
      };

      const handleCallRejected = () => {
        cleanupCall();
        alert('Call was declined');
      };

      const handleCallEnded = () => {
        cleanupCall();
      };

      const handleIceCandidate = async ({ candidate }) => {
        if (peerRef.current && candidate) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('messages_read', handleMessagesRead);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('incoming_call', handleIncomingCall);
      socket.on('call_accepted', handleCallAccepted);
      socket.on('call_rejected', handleCallRejected);
      socket.on('call_ended', handleCallEnded);
      socket.on('ice_candidate', handleIceCandidate);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('messages_read', handleMessagesRead);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
        socket.off('message_deleted', handleMessageDeleted);
        socket.off('incoming_call', handleIncomingCall);
        socket.off('call_accepted', handleCallAccepted);
        socket.off('call_rejected', handleCallRejected);
        socket.off('call_ended', handleCallEnded);
        socket.off('ice_candidate', handleIceCandidate);
      };
    }
  }, [targetUser, socket, currentUserId]);

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState(null);
    setIncomingCall(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  // WebRTC Call Setup Helper
  const setupPeerConnection = (stream, targetUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice_candidate', { to: targetUserId, candidate: event.candidate });
      }
    };

    peerRef.current = pc;
    return pc;
  };

  const startCall = async (type = 'video') => {
    if (!targetUser || !socket) return;
    try {
      const constraints = { audio: true, video: type === 'video' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setCallState({ status: 'calling', callType: type });

      const pc = setupPeerConnection(stream, targetUser._id);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', {
        userToCall: targetUser._id,
        signalData: offer,
        callType: type
      });
    } catch (err) {
      console.error('Failed to get media devices for call:', err);
      alert('Camera/Microphone permission is required to start a call.');
      cleanupCall();
    }
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall || !socket) return;
    try {
      const isVideo = incomingCall.callType === 'video';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      setLocalStream(stream);
      setCallState({ status: 'connected', callType: incomingCall.callType, callId: incomingCall.callId });

      const pc = setupPeerConnection(stream, incomingCall.from._id);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer_call', {
        to: incomingCall.from._id,
        signal: answer,
        callId: incomingCall.callId
      });

      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call:', err);
      alert('Could not access media devices.');
      cleanupCall();
    }
  };

  const declineIncomingCall = () => {
    if (incomingCall && socket) {
      socket.emit('reject_call', { to: incomingCall.from._id, callId: incomingCall.callId });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (socket && targetUser) {
      socket.emit('end_call', { to: targetUser._id, callId: callState?.callId });
    }
    cleanupCall();
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, selectedImage]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket && targetUser) {
      socket.emit('typing', { receiverId: targetUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { receiverId: targetUser._id });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if ((!inputText.trim() && !selectedImage) || !socket || !targetUser) return;
    socket.emit('send_message', {
      receiverId: targetUser._id,
      message: inputText.trim(),
      image: selectedImage || ''
    });
    socket.emit('stop_typing', { receiverId: targetUser._id });
    setInputText('');
    setSelectedImage(null);
    setShowEmojiPicker(false);
  };

  const handleRightClick = (e, msg) => {
    e.preventDefault();
    const isMe = msg.senderId?.toString() === currentUserId?.toString();
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg, isMe });
  };

  const handleDeleteForMe = async (msg) => {
    try {
      await deleteMessageAPI(msg._id, 'for_me');
      setMessages((prev) => prev.filter((m) => m._id !== msg._id));
    } catch (err) {
      console.error('Delete for me failed:', err);
    }
  };

  const handleDeleteForEveryone = async (msg) => {
    try {
      await deleteMessageAPI(msg._id, 'for_everyone');
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msg._id
            ? { ...m, deletedForEveryone: true, message: '', image: '' }
            : m
        )
      );
      if (socket && targetUser) {
        socket.emit('delete_message_for_everyone', {
          messageId: msg._id,
          receiverId: targetUser._id
        });
      }
    } catch (err) {
      console.error('Delete for everyone failed:', err);
    }
  };

  // Rich Chat Empty State
  if (!targetUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600/20 via-cyan-500/20 to-teal-400/20 flex items-center justify-center ring-4 ring-brand-500/10 shadow-2xl animate-float">
            <MessageSquare className="w-12 h-12 text-brand-600 dark:text-cyan-400 stroke-[1.5]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight mb-2">
          Start your first skill exchange
        </h3>
        
        <p className="text-xs sm:text-sm max-w-md text-slate-500 dark:text-slate-400 leading-relaxed">
          Connect with someone and start learning together. Select a partner conversation from the list to send messages, discuss schedules, and share knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden relative">

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isMe={contextMenu.isMe}
          onClose={() => setContextMenu(null)}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
        />
      )}

      {/* Chat Header */}
      <div className="px-5 py-3.5 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`}
              alt={targetUser.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-brand-500/30"
            />
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${isTargetOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">{targetUser.name}</h3>
            <p className={`text-xs font-semibold ${isTargetOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {isTargetOnline ? '● Online now' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => startCall('voice')}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400"
            title="Start Voice Call"
          >
            <PhoneCall className="w-4 h-4" />
          </button>
          <button
            onClick={() => startCall('video')}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400"
            title="Start Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50/60 dark:bg-slate-950/60"
        onClick={() => setShowEmojiPicker(false)}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs italic space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-cyan-400">
              <Send className="w-7 h-7" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">No messages yet</p>
            <p className="text-slate-500 text-xs">Say hello to start your skill swap exchange!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId?.toString() === currentUserId?.toString();
            const isDeletedForAll = msg.deletedForEveryone;

            const prevMsg = messages[index - 1];
            const isSameAsPrev = prevMsg && prevMsg.senderId?.toString() === msg.senderId?.toString();
            const showAvatar = !isMe && !isSameAsPrev;

            return (
              <div
                key={msg._id || index}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSameAsPrev ? 'mt-0.5' : 'mt-3'} animate-fade-in`}
              >
                {/* Avatar for received messages */}
                {!isMe && (
                  <div className="w-8 flex-shrink-0 mr-2 self-end">
                    {showAvatar && (
                      <img
                        src={targetUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`}
                        alt={targetUser.name}
                        className="w-7 h-7 rounded-xl object-cover"
                      />
                    )}
                  </div>
                )}

                <div
                  onContextMenu={(e) => !isDeletedForAll && handleRightClick(e, msg)}
                  className={`max-w-[75%] sm:max-w-[65%] group relative cursor-pointer`}
                >
                  <div
                    className={`px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm transition-all
                      ${isDeletedForAll
                        ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 italic rounded-2xl border border-slate-300/50 dark:border-slate-700/50'
                        : isMe
                        ? 'bg-brand-600 text-white rounded-3xl rounded-br-xs shadow-brand-500/15'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl rounded-bl-xs'
                      }`}
                  >
                    {isDeletedForAll ? (
                      <span className="flex items-center space-x-1">
                        <Trash2 className="w-3.5 h-3.5 inline" />
                        <span>This message was deleted</span>
                      </span>
                    ) : (
                      <>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Attachment"
                            className="max-w-full max-h-60 rounded-2xl mb-2 object-cover"
                          />
                        )}
                        {msg.message && <p className="whitespace-pre-wrap break-words">{msg.message}</p>}
                      </>
                    )}

                    {/* Metadata & Status */}
                    {!isDeletedForAll && (
                      <div
                        className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                          isMe ? 'text-brand-100/80' : 'text-slate-400'
                        }`}
                      >
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <span>
                            {msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-brand-200" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 italic mt-2 animate-fade-in pl-10">
            <span className="font-semibold text-brand-600 dark:text-cyan-400">{targetUser.name}</span>
            <span>is typing</span>
            <div className="flex items-center space-x-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce-dot" style={{ animationDelay: '0s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-500/30" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Image attached</span>
          </div>
          <button onClick={() => setSelectedImage(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-[72px] left-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 grid grid-cols-7 gap-2 animate-fade-in">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => { setInputText((prev) => prev + emoji); setShowEmojiPicker(false); }}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar / Composer */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center space-x-2 flex-shrink-0 sticky bottom-0 z-30">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2.5 text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-slate-400 hover:text-brand-600 dark:hover:text-cyan-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          title="Attach Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input type="file" ref={fileInputRef} onChange={handleImageFileSelect} accept="image/*" className="hidden" />

        <textarea
          rows={1}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!inputText.trim() && !selectedImage}
          className="btn-connect !py-2.5 !px-4 !rounded-2xl"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* WebRTC Call Modals */}
      <IncomingCallModal
        incomingCall={incomingCall}
        onAccept={acceptIncomingCall}
        onDecline={declineIncomingCall}
      />

      <ActiveCallModal
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        onEndCall={endCall}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        targetUser={targetUser}
      />
    </div>
  );
};

export default ChatWindow;
