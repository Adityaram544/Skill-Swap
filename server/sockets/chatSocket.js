const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Message = require('../models/Message');
const Call = require('../models/Call');

// Map of userId -> Set of socketIds
const onlineUsers = new Map();

const initSocket = (io) => {
  // Socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Register user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Update DB status to online
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Join personal room for private notifications and calling
    socket.join(userId);

    // Broadcast online status to all clients
    io.emit('user_status', { userId, isOnline: true, onlineUsers: Array.from(onlineUsers.keys()) });
    socket.emit('online_users_list', Array.from(onlineUsers.keys()));

    // Handle joining room with specific target user
    socket.on('join_chat', ({ targetUserId }) => {
      const roomId = [userId, targetUserId].sort().join('_');
      socket.join(roomId);
    });

    // Handle sending message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, message, image } = data;
        if (!receiverId || (!message && !image)) return;

        const newMsg = await Message.create({
          senderId: userId,
          receiverId,
          message: (message || '').trim(),
          image: image || '',
          read: false
        });

        const roomId = [userId, receiverId].sort().join('_');

        // Emit message to room
        io.to(roomId).emit('receive_message', newMsg);

        // Also notify receiver's personal socket room for unread badges
        io.to(receiverId).emit('new_message_notification', {
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          message: newMsg
        });
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Handle mark read
    socket.on('mark_read', async ({ senderId }) => {
      try {
        if (!senderId) return;
        await Message.updateMany(
          { senderId, receiverId: userId, read: false },
          { read: true }
        );
        const roomId = [userId, senderId].sort().join('_');
        io.to(roomId).emit('messages_read', { readerId: userId, senderId });
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    // Handle typing indicators
    socket.on('typing', ({ receiverId }) => {
      const roomId = [userId, receiverId].sort().join('_');
      socket.to(roomId).emit('user_typing', { senderId: userId });
    });

    socket.on('stop_typing', ({ receiverId }) => {
      const roomId = [userId, receiverId].sort().join('_');
      socket.to(roomId).emit('user_stop_typing', { senderId: userId });
    });

    // Handle real-time delete for everyone
    socket.on('delete_message_for_everyone', ({ messageId, receiverId }) => {
      const roomId = [userId, receiverId].sort().join('_');
      io.to(roomId).emit('message_deleted', { messageId });
    });

    // ── WebRTC Signaling Events ──
    socket.on('call_user', async ({ userToCall, signalData, callType }) => {
      try {
        const newCall = await Call.create({
          callerId: userId,
          receiverId: userToCall,
          callType: callType || 'video',
          status: 'calling',
          startedAt: new Date()
        });

        io.to(userToCall).emit('incoming_call', {
          callId: newCall._id,
          signal: signalData,
          from: {
            _id: socket.user._id,
            name: socket.user.name,
            avatar: socket.user.avatar
          },
          callType: callType || 'video'
        });
      } catch (err) {
        console.error('Call_user error:', err);
      }
    });

    socket.on('answer_call', async ({ to, signal, callId }) => {
      try {
        if (callId) {
          await Call.findByIdAndUpdate(callId, { status: 'accepted' });
        }
        io.to(to).emit('call_accepted', { signal, callId });
      } catch (err) {
        console.error('Answer_call error:', err);
      }
    });

    socket.on('reject_call', async ({ to, callId }) => {
      try {
        if (callId) {
          await Call.findByIdAndUpdate(callId, { status: 'rejected', endedAt: new Date() });
        }
        io.to(to).emit('call_rejected', { callId });
      } catch (err) {
        console.error('Reject_call error:', err);
      }
    });

    socket.on('end_call', async ({ to, callId }) => {
      try {
        if (callId) {
          const callDoc = await Call.findById(callId);
          if (callDoc) {
            const endedAt = new Date();
            const duration = Math.round((endedAt - callDoc.startedAt) / 1000);
            await Call.findByIdAndUpdate(callId, { status: 'ended', endedAt, duration });
          }
        }
        if (to) {
          io.to(to).emit('call_ended');
        }
      } catch (err) {
        console.error('End_call error:', err);
      }
    });

    socket.on('ice_candidate', ({ to, candidate }) => {
      io.to(to).emit('ice_candidate', { candidate });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
          io.emit('user_status', { userId, isOnline: false, onlineUsers: Array.from(onlineUsers.keys()) });
        }
      }
    });
  });
};

module.exports = initSocket;


