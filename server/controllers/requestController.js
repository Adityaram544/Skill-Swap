const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

// @desc    Send swap request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { receiverId, offeredSkill, requestedSkill, message } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !offeredSkill || !requestedSkill) {
      return res.status(400).json({ message: 'Receiver ID, offered skill, and requested skill are required' });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot send a swap request to yourself' });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check for existing pending request between these two
    const existingRequest = await SwapRequest.findOne({
      senderId,
      receiverId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request sent to this user' });
    }

    const request = await SwapRequest.create({
      senderId,
      receiverId,
      offeredSkill,
      requestedSkill,
      message: message || `Hi ${receiverExists.name}, I'd love to swap skills with you!`,
      status: 'Pending'
    });

    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('senderId', 'name email avatar bio location')
      .populate('receiverId', 'name email avatar bio location');

    res.status(201).json(populatedRequest);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests for logged in user (sent & received)
// @route   GET /api/requests
// @access  Private
const getUserRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, type } = req.query;

    let filter = {
      $or: [{ senderId: userId }, { receiverId: userId }]
    };

    if (type === 'sent') {
      filter = { senderId: userId };
    } else if (type === 'received') {
      filter = { receiverId: userId };
    }

    if (status) {
      filter.status = status;
    }

    const requests = await SwapRequest.find(filter)
      .populate('senderId', 'name email avatar bio location skillsOffered skillsWanted')
      .populate('receiverId', 'name email avatar bio location skillsOffered skillsWanted')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or Reject swap request
// @route   PATCH /api/requests/:id
// @access  Private
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['Accepted', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const request = await SwapRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Safely extract IDs whether populated or raw ObjectId
    const senderIdStr = request.senderId?.toString();
    const receiverIdStr = request.receiverId?.toString();
    const currentUserIdStr = req.user._id.toString();

    console.log('[updateRequestStatus] senderId:', senderIdStr);
    console.log('[updateRequestStatus] receiverId:', receiverIdStr);
    console.log('[updateRequestStatus] currentUser:', currentUserIdStr);
    console.log('[updateRequestStatus] status to set:', status);

    // Only receiver can accept/reject; sender can cancel
    if (status === 'Cancelled') {
      if (senderIdStr !== currentUserIdStr) {
        return res.status(403).json({ message: 'Only the sender can cancel a request' });
      }
    } else {
      if (receiverIdStr !== currentUserIdStr) {
        return res.status(403).json({ message: 'Only the receiver can accept or reject a request' });
      }
    }

    request.status = status;
    await request.save();

    const updated = await SwapRequest.findById(requestId)
      .populate('senderId', 'name email avatar bio location')
      .populate('receiverId', 'name email avatar bio location');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getUserRequests, updateRequestStatus };
