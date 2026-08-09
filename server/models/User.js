const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'General' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' },
  description: { type: String, default: '' },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Passionate about learning and sharing skills!' },
    location: { type: String, default: 'Remote' },
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    skillsOffered: [skillItemSchema],
    skillsWanted: [skillItemSchema],
    availability: { type: mongoose.Schema.Types.Mixed, default: ['Flexible'] },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    settings: {
      themePreference: { type: String, default: 'dark' },
      emailNotifications: { type: Boolean, default: true },
      matchAlerts: { type: Boolean, default: true },
      chatSound: { type: Boolean, default: true },
      profileVisibility: { type: String, default: 'public' }
    }
  },
  { timestamps: true }
);


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
