const express = require('express');
const router = express.Router();
const { getSkills, addSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getSkills);
router.post('/', protect, addSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
