const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    callType: {
      type: String,
      enum: ['voice', 'video'],
      default: 'video'
    },
    status: {
      type: String,
      enum: ['calling', 'accepted', 'rejected', 'missed', 'ended'],
      default: 'calling'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date
    },
    duration: {
      type: Number, // in seconds
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Call', callSchema);
