const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { verifyToken } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/messages/:chatId
router.get('/:chatId', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('remitente', 'nombre avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages - enviar mensaje de texto
router.post('/', verifyToken, async (req, res) => {
  try {
    const { chatId, contenido } = req.body;
    const msg = await Message.create({ chatId, remitente: req.user.id, contenido, tipo: 'texto' });
    await Chat.findByIdAndUpdate(chatId, { ultimoMensaje: msg._id });
    const populated = await msg.populate('remitente', 'nombre avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/imagen - enviar imagen
router.post('/imagen', verifyToken, upload.single('imagen'), async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No se envió imagen' });

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'chatapp' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }).end(req.file.buffer);
    });

    const msg = await Message.create({
      chatId,
      remitente: req.user.id,
      tipo: 'imagen',
      archivoUrl: result.secure_url,
    });
    await Chat.findByIdAndUpdate(chatId, { ultimoMensaje: msg._id });
    const populated = await msg.populate('remitente', 'nombre avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
