const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat message history with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getMessagesWithUser = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId }
      ],
      deletedForEveryone: { $ne: true },
      deletedFor: { $nin: [currentUserId] }
    }).sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { senderId: targetUserId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent conversation contacts list for current user
// @route   GET /api/messages/conversations/list
// @access  Private
const getRecentConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const SwapRequest = require('../models/SwapRequest');

    const contactMap = new Map();

    // 1. People already messaged
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    }).sort({ createdAt: -1 });

    messages.forEach((msg) => {
      const otherId = msg.senderId.toString() !== currentUserId.toString()
        ? msg.senderId.toString()
        : msg.receiverId.toString();
      if (!contactMap.has(otherId)) contactMap.set(otherId, true);
    });

    // 2. Accepted swap partners (even if no messages yet)
    const acceptedSwaps = await SwapRequest.find({
      status: 'Accepted',
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    });

    acceptedSwaps.forEach((swap) => {
      const otherId = swap.senderId.toString() !== currentUserId.toString()
        ? swap.senderId.toString()
        : swap.receiverId.toString();
      if (!contactMap.has(otherId)) contactMap.set(otherId, true);
    });

    const allContactIds = Array.from(contactMap.keys());

    const contacts = await User.find({ _id: { $in: allContactIds } }).select(
      'name avatar bio location isOnline lastSeen'
    );

    const conversationsWithDetails = await Promise.all(
      contacts.map(async (contact) => {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: currentUserId, receiverId: contact._id },
            { senderId: contact._id, receiverId: currentUserId }
          ],
          deletedForEveryone: { $ne: true },
          deletedFor: { $nin: [currentUserId] }
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          senderId: contact._id,
          receiverId: currentUserId,
          read: false,
          deletedForEveryone: { $ne: true },
          deletedFor: { $nin: [currentUserId] }
        });

        return {
          user: contact,
          lastMessage: lastMsg ? lastMsg.message : '',
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          unreadCount
        };
      })
    );

    conversationsWithDetails.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

    res.json(conversationsWithDetails);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single message (for me OR for everyone)
// @route   DELETE /api/messages/message/:messageId
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { deleteType } = req.body; // 'for_me' | 'for_everyone'
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (deleteType === 'for_everyone') {
      if (message.senderId.toString() !== currentUserId.toString()) {
        return res.status(403).json({ message: 'Only the sender can delete for everyone' });
      }
      message.deletedForEveryone = true;
      message.message = '';
      message.image = '';
    } else {
      if (!message.deletedFor.map(id => id.toString()).includes(currentUserId.toString())) {
        message.deletedFor.push(currentUserId);
      }
    }

    await message.save();
    res.json({ success: true, messageId, deleteType });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a contact / entire conversation for current user
// @route   DELETE /api/messages/contact/:contactId
// @access  Private
const deleteContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        $or: [
          { senderId: currentUserId, receiverId: contactId },
          { senderId: contactId, receiverId: currentUserId }
        ]
      },
      { $addToSet: { deletedFor: currentUserId } }
    );

    res.json({ success: true, message: 'Contact removed for you' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessagesWithUser, getRecentConversations, deleteMessage, deleteContact };
