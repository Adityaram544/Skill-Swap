const Skill = require('../models/Skill');

// @desc    Get all predefined skill categories and skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(query).sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

// @desc    Add new global skill (or custom skill)
// @route   POST /api/skills
// @access  Private
const addSkill = async (req, res, next) => {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const existing = await Skill.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      return res.json(existing);
    }

    const skill = await Skill.create({
      name: name.trim(),
      category: category || 'Other',
      description: description || ''
    });

    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill by ID
// @route   DELETE /api/skills/:id
// @access  Private
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    await skill.deleteOne();
    res.json({ message: 'Skill removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSkills, addSkill, deleteSkill };
