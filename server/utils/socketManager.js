// Socket manager for handling real-time notifications
let io = null;
const userSockets = new Map(); // Map userId to socketId

const initializeSocket = (socketIO) => {
  io = socketIO;
  
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Authenticate and register user
    socket.on('register', (userId) => {
      if (userId) {
        userSockets.set(userId.toString(), socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        socket.userId = userId;
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId.toString());
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (!io) {
    console.error('Socket.IO not initialized');
    return false;
  }

  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`Emitted ${event} to user ${userId}`);
    return true;
  }
  
  console.log(`User ${userId} not connected`);
  return false;
};

const isUserOnline = (userId) => {
  return userSockets.has(userId.toString());
};

module.exports = {
  initializeSocket,
  emitToUser,
  isUserOnline
};
