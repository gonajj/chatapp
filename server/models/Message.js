const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    remitente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contenido: { type: String, default: '' },
    tipo: { type: String, enum: ['texto', 'imagen', 'archivo'], default: 'texto' },
    archivoUrl: { type: String, default: '' },
    leido: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
