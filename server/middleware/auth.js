const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No autorizado'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Token inválido'));
  }
};

module.exports = { verifyToken, verifySocketToken };
