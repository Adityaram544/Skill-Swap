const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification(s) as read
// @route   PATCH /api/notifications/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.body;
    if (id) {
      await Notification.updateOne({ _id: id, recipient: req.user._id }, { read: true });
    } else {
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    }
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, clearNotifications };
