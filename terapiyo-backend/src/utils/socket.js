import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { redis } from '../config/database.js';
import logger from '../config/logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // JWT Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;

      // Check if token is blacklisted
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return next(new Error('Token is invalid'));
      }

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Handle typing status
    socket.on('typing_start', (chatId) => {
      socket.to(chatId).emit('typing_start', {
        chatId,
        userId: socket.userId
      });
    });

    socket.on('typing_end', (chatId) => {
      socket.to(chatId).emit('typing_end', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle online status
    socket.on('set_online', async () => {
      await redis.set(`user:${socket.userId}:online`, 'true', 'EX', 300);
      socket.broadcast.emit('user_online', socket.userId);
    });

    socket.on('disconnect', async () => {
      await redis.del(`user:${socket.userId}:online`);
      socket.broadcast.emit('user_offline', socket.userId);
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const emitSocketEvent = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

export const getUserOnlineStatus = async (userId) => {
  return await redis.get(`user:${socket.userId}:online`) === 'true';
};

export default {
  initializeSocket,
  emitSocketEvent,
  getUserOnlineStatus
};
