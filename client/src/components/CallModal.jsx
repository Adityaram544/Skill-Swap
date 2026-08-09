import React, { useEffect, useRef, useState } from 'react';
import {
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff,
  Sparkles, Maximize2, Minimize2
} from 'lucide-react';

// ── 1. INCOMING CALL MODAL ──
export const IncomingCallModal = ({ incomingCall, onAccept, onDecline }) => {
  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-block">
          <img
            src={incomingCall.from?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.from?.name}`}
            alt={incomingCall.from?.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-brand-500/30 mx-auto shadow-xl"
          />
          <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
            {incomingCall.callType === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          </span>
        </div>

        <div>
          <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
            {incomingCall.from?.name}
          </h3>
          <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider mt-1">
            Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call...
          </p>
        </div>

        <div className="flex items-center justify-center space-x-6 pt-2">
          <button
            onClick={onDecline}
            className="w-14 h-14 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95"
            title="Decline Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <button
            onClick={onAccept}
            className="w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-110 active:scale-95 animate-bounce-slow"
            title="Accept Call"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 2. ACTIVE CALL OVERLAY MODAL ──
export const ActiveCallModal = ({
  callState,
  localStream,
  remoteStream,
  onEndCall,
  isMuted,
  isCameraOff,
  onToggleMic,
  onToggleCamera,
  targetUser
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  // Bind streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Duration Timer
  useEffect(() => {
    let timer;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!callState) return null;

  const isVideo = callState.callType === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/95 backdrop-blur-xl animate-fade-in p-4">
      <div className="relative w-full max-w-4xl h-[85vh] bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-navy-950/80 to-transparent">
          <div className="flex items-center space-x-3">
            <img
              src={targetUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser?.name}`}
              alt={targetUser?.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-brand-500/30"
            />
            <div>
              <h3 className="font-display font-bold text-white text-base leading-tight">
                {targetUser?.name}
              </h3>
              <p className="text-xs text-brand-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {callState === 'calling' ? 'Calling...' : callState === 'connected' ? `Call Connected • ${formatDuration(callDuration)}` : 'Connecting...'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
            {isVideo ? 'Video Call' : 'Voice Call'}
          </span>
        </div>

        {/* Video / Audio Stage */}
        <div className="relative flex-1 bg-navy-950 flex items-center justify-center overflow-hidden">
          
          {/* Remote Video Stream or Avatar fallback */}
          {isVideo && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <img
                  src={targetUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser?.name}`}
                  alt={targetUser?.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-brand-500/40 shadow-2xl animate-pulse-slow"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-navy-900" />
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {callState === 'calling' ? `Ringing ${targetUser?.name}...` : '1-on-1 Peer Audio Exchange'}
              </p>
            </div>
          )}

          {/* Local Video Preview (Bottom Right thumbnail) */}
          {isVideo && localStream && (
            <div className="absolute bottom-4 right-4 w-36 sm:w-48 h-28 sm:h-36 rounded-2xl overflow-hidden border-2 border-brand-500/40 shadow-2xl bg-navy-900 z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            </div>
          )}
        </div>

        {/* Floating Call Toolbar Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-4 px-6 py-3 rounded-2xl bg-navy-900/90 border border-navy-700/80 backdrop-blur-xl shadow-2xl">
          
          {/* Toggle Mic */}
          <button
            onClick={onToggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-navy-800 text-slate-200 hover:bg-navy-700 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Camera (if Video Call) */}
          {isVideo && (
            <button
              onClick={onToggleCamera}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isCameraOff
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-navy-800 text-slate-200 hover:bg-navy-700 hover:text-white'
              }`}
              title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-14 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all transform hover:scale-105 active:scale-95"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
