const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign({ id: user._id, nombre: user.nombre, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ message: 'Email ya registrado' });

    const user = await User.create({ nombre, email, password });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Credenciales incorrectas' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Credenciales incorrectas' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
