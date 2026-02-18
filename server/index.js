require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const { verifySocketToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => console.error('❌ Error MongoDB:', err));

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.use(verifySocketToken);

io.on('connection', (socket) => {
  const userId = socket.user.id;
  onlineUsers.set(userId, socket.id);
  io.emit('users_online', Array.from(onlineUsers.keys()));
  console.log(`🟢 Usuario conectado: ${userId}`);

  // Join personal room
  socket.join(userId);

  // Join chat rooms
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
  });

  // Send message
  socket.on('send_message', (message) => {
    io.to(message.chatId).emit('receive_message', message);
  });

  // Typing indicator
  socket.on('typing', ({ chatId, userName }) => {
    socket.to(chatId).emit('user_typing', { chatId, userName });
  });

  socket.on('stop_typing', ({ chatId }) => {
    socket.to(chatId).emit('user_stop_typing', { chatId });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('users_online', Array.from(onlineUsers.keys()));
    console.log(`🔴 Usuario desconectado: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
