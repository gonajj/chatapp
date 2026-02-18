const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

// GET /api/chats - mis chats
router.get('/', verifyToken, async (req, res) => {
  try {
    const chats = await Chat.find({ participantes: req.user.id })
      .populate('participantes', 'nombre avatar email')
      .populate({ path: 'ultimoMensaje', populate: { path: 'remitente', select: 'nombre' } })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chats/privado - crear o abrir chat privado
router.post('/privado', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    let chat = await Chat.findOne({
      tipo: 'privado',
      participantes: { $all: [req.user.id, userId], $size: 2 },
    }).populate('participantes', 'nombre avatar email');

    if (!chat) {
      chat = await Chat.create({ tipo: 'privado', participantes: [req.user.id, userId] });
      chat = await chat.populate('participantes', 'nombre avatar email');
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chats/grupo - crear grupo
router.post('/grupo', verifyToken, async (req, res) => {
  try {
    const { nombre, participantes } = req.body;
    const todos = [...new Set([req.user.id, ...participantes])];
    const chat = await Chat.create({
      tipo: 'grupo',
      nombre,
      participantes: todos,
      admins: [req.user.id],
    });
    const populated = await chat.populate('participantes', 'nombre avatar email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
