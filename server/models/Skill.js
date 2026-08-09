const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Technology', 'Languages', 'Design', 'Music', 'Business', 'Lifestyle', 'Arts & Crafts', 'Fitness', 'Cooking', 'Other'],
      default: 'Technology'
    },
    description: { type: String, default: '' },
    icon: { type: String, default: 'Code' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
