const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, location, avatar, availability, experienceLevel, skillsOffered, skillsWanted, settings } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;
    if (availability !== undefined) user.availability = availability;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (settings !== undefined) {
      user.settings = { ...(user.settings || {}), ...settings };
    }


    // Filter duplicates case-insensitively when updating skill arrays
    if (skillsOffered !== undefined && Array.isArray(skillsOffered)) {
      const uniqueOffered = [];
      const seenNames = new Set();
      for (const s of skillsOffered) {
        if (s && s.name && s.name.trim()) {
          const norm = s.name.trim().toLowerCase();
          if (!seenNames.has(norm)) {
            seenNames.add(norm);
            uniqueOffered.push({
              name: s.name.trim(),
              category: s.category || 'Technology',
              level: s.level || 'Intermediate',
              description: s.description || ''
            });
          }
        }
      }
      user.skillsOffered = uniqueOffered;
    }

    if (skillsWanted !== undefined && Array.isArray(skillsWanted)) {
      const uniqueWanted = [];
      const seenNames = new Set();
      for (const s of skillsWanted) {
        if (s && s.name && s.name.trim()) {
          const norm = s.name.trim().toLowerCase();
          if (!seenNames.has(norm)) {
            seenNames.add(norm);
            uniqueWanted.push({
              name: s.name.trim(),
              category: s.category || 'Technology',
              level: s.level || 'Intermediate',
              description: s.description || ''
            });
          }
        }
      }
      user.skillsWanted = uniqueWanted;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture (base64 image storage)
// @route   POST /api/users/upload
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    const { image } = req.body; // base64 string
    if (!image) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = image;
    const updatedUser = await user.save();

    res.json({ avatar: updatedUser.avatar, user: updatedUser, message: 'Profile picture uploaded successfully' });
  } catch (error) {
    next(error);
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with optional query filter)
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skillsOffered.name': { $regex: search, $options: 'i' } },
        { 'skillsWanted.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query['skillsOffered.category'] = category;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile, uploadAvatar, getUserById, getAllUsers };
