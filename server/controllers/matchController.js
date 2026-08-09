const User = require('../models/User');

// Helper function to test if two skill names match (exact or substring)
const isSkillMatch = (nameA = '', nameB = '') => {
  const normA = nameA.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normB = nameB.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!normA || !normB) return false;
  return normA === normB || normA.includes(normB) || normB.includes(normA);
};

// @desc    Get matches for logged-in user based on skill alignment
// @route   GET /api/matches
// @access  Private
const getMatches = async (req, res, next) => {
  try {
    const me = await User.findById(req.user._id);

    if (!me) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otherUsers = await User.find({ _id: { $ne: me._id } }).select('-password');

    const matches = otherUsers
      .map((other) => {
        // Skills I can teach that OTHER wants
        const iCanTeachOtherWants = (me.skillsOffered || []).filter((mySkill) =>
          (other.skillsWanted || []).some((otherWanted) => isSkillMatch(mySkill.name, otherWanted.name))
        );

        // Skills OTHER can teach that I want
        const otherCanTeachIWant = (other.skillsOffered || []).filter((otherSkill) =>
          (me.skillsWanted || []).some((myWanted) => isSkillMatch(otherSkill.name, myWanted.name))
        );

        // Mutual match check
        const isReciprocalMatch = iCanTeachOtherWants.length > 0 && otherCanTeachIWant.length > 0;

        // Shared categories
        const myCategories = (me.skillsOffered || []).map((s) => (s.category || '').toLowerCase());
        const otherCategories = (other.skillsOffered || []).map((s) => (s.category || '').toLowerCase());
        const commonSkillCategories = [
          ...new Set(myCategories.filter((cat) => cat && otherCategories.includes(cat)))
        ];

        // Availability match check
        const myAvail = Array.isArray(me.availability) ? me.availability : [me.availability || 'Flexible'];
        const otherAvail = Array.isArray(other.availability) ? other.availability : [other.availability || 'Flexible'];
        const availabilityMatch = myAvail.some(
          (a) => a === 'Flexible' || otherAvail.includes('Flexible') || otherAvail.includes(a)
        );

        // Location match check
        const myLoc = (me.location || 'Remote').toLowerCase().trim();
        const otherLoc = (other.location || 'Remote').toLowerCase().trim();
        const locationMatch =
          myLoc === 'remote' || otherLoc === 'remote' || myLoc === otherLoc || myLoc.includes(otherLoc) || otherLoc.includes(myLoc);

        // Calculate match percentage score
        let score = 0;
        if (isReciprocalMatch) {
          score = 85 + Math.min(10, (iCanTeachOtherWants.length + otherCanTeachIWant.length) * 3);
        } else if (otherCanTeachIWant.length > 0) {
          score = 68 + Math.min(15, otherCanTeachIWant.length * 5);
        } else if (iCanTeachOtherWants.length > 0) {
          score = 52 + Math.min(15, iCanTeachOtherWants.length * 5);
        } else if (commonSkillCategories.length > 0) {
          score = 35 + Math.min(12, commonSkillCategories.length * 4);
        } else {
          score = 20;
        }

        if (availabilityMatch) score += 3;
        if (locationMatch) score += 2;

        return {
          user: other,
          matchPercentage: Math.min(100, Math.round(score)),
          isReciprocal: isReciprocalMatch,
          iCanTeachOther: iCanTeachOtherWants,
          otherCanTeachMe: otherCanTeachIWant,
          commonCategories: commonSkillCategories,
          availabilityMatch,
          locationMatch
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(matches);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMatches };


