const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['privado', 'grupo'], default: 'privado' },
    nombre: { type: String, default: '' }, // solo para grupos
    imagen: { type: String, default: '' }, // foto del grupo
    participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    ultimoMensaje: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
