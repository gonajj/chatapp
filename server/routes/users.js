const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// GET /api/users/buscar?q=nombre
router.get('/buscar', verifyToken, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user.id },
    }).select('-password').limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
