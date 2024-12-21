import { redis } from '../config/database.js';
import { Chat, Message } from '../models/messaging.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { emitSocketEvent } from '../utils/socket.js';

class ChatService {
  /**
   * Create new chat
   */
  async createChat(data) {
    try {
      const chat = await Chat.create(data);
      
      // Create system message for chat creation
      await Message.create({
        chat: chat._id,
        sender: data.participants[0].user,
        content: 'Sohbet başlatıldı',
        type: 'system'
      });

      return chat;
    } catch (error) {
      logger.error('Error creating chat:', error);
      throw error;
    }
  }

  /**
   * Get chat by ID
   */
  async getChat(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId)
        .populate('participants.user', 'firstName lastName email profileImage')
        .populate('appointment');

      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      if (!chat.isParticipant(userId)) {
        throw new ApiError(403, 'Not authorized to access this chat');
      }

      return chat;
    } catch (error) {
      logger.error('Error getting chat:', error);
      throw error;
    }
  }

  /**
   * Get user chats
   */
  async getUserChats(userId, filters = {}) {
    try {
      const { status, type, page = 1, limit = 20 } = filters;

      // Try to get from cache
      const cacheKey = `chats:${userId}:${JSON.stringify(filters)}`;
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // Build query
      const query = {
        'participants.user': userId,
        status: status || 'active'
      };
      if (type) query.type = type;

      const chats = await Chat.find(query)
        .populate('participants.user', 'firstName lastName email profileImage')
        .populate('appointment')
        .sort({ 'lastMessage.timestamp': -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Chat.countDocuments(query);

      const result = {
        chats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

      // Cache result
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // 5 minutes

      return result;
    } catch (error) {
      logger.error('Error getting user chats:', error);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(chatId, userId, messageData) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      if (!chat.isParticipant(userId)) {
        throw new ApiError(403, 'Not authorized to send message in this chat');
      }

      // Create message
      const message = await Message.create({
        chat: chatId,
        sender: userId,
        ...messageData
      });

      // Update chat
      await chat.addMessage({
        content: messageData.content,
        sender: userId,
        type: messageData.type
      });

      // Emit socket event
      chat.participants.forEach(participant => {
        if (participant.user.toString() !== userId.toString()) {
          emitSocketEvent(participant.user.toString(), 'new_message', {
            chat: chatId,
            message
          });
        }
      });

      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get chat messages
   */
  async getChatMessages(chatId, userId, filters = {}) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      if (!chat.isParticipant(userId)) {
        throw new ApiError(403, 'Not authorized to view this chat');
      }

      const { before, limit = 50 } = filters;
      const query = {
        chat: chatId,
        'deletedFor.user': { $ne: userId }
      };

      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await Message.find(query)
        .populate('sender', 'firstName lastName email profileImage')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .limit(limit);

      return messages;
    } catch (error) {
      logger.error('Error getting chat messages:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isParticipant(userId)) {
        throw new ApiError(404, 'Chat not found');
      }

      // Mark chat as read
      await chat.markAsRead(userId);

      // Mark messages as read
      await Message.updateMany(
        {
          chat: chatId,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              user: userId,
              timestamp: new Date()
            }
          },
          $set: { status: 'read' }
        }
      );

      // Emit socket event
      chat.participants.forEach(participant => {
        if (participant.user.toString() !== userId.toString()) {
          emitSocketEvent(participant.user.toString(), 'messages_read', {
            chat: chatId,
            reader: userId
          });
        }
      });

      return chat;
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId)
        .populate('chat');

      if (!message) {
        throw new ApiError(404, 'Message not found');
      }

      if (!message.chat.isParticipant(userId)) {
        throw new ApiError(403, 'Not authorized to delete this message');
      }

      await message.deleteForUser(userId);

      return message;
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Start therapy session
   */
  async startSession(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      const therapist = chat.participants.find(p => p.role === 'therapist');
      if (therapist.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only therapist can start session');
      }

      chat.metadata.sessionStartTime = new Date();
      chat.metadata.isSessionActive = true;
      await chat.save();

      // Create system message
      await Message.create({
        chat: chatId,
        sender: userId,
        content: 'Terapi seansı başladı',
        type: 'system'
      });

      // Emit socket event
      chat.participants.forEach(participant => {
        emitSocketEvent(participant.user.toString(), 'session_started', {
          chat: chatId
        });
      });

      return chat;
    } catch (error) {
      logger.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * End therapy session
   */
  async endSession(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      const therapist = chat.participants.find(p => p.role === 'therapist');
      if (therapist.user.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only therapist can end session');
      }

      chat.metadata.sessionEndTime = new Date();
      chat.metadata.isSessionActive = false;
      await chat.save();

      // Create system message
      await Message.create({
        chat: chatId,
        sender: userId,
        content: 'Terapi seansı sona erdi',
        type: 'system'
      });

      // Emit socket event
      chat.participants.forEach(participant => {
        emitSocketEvent(participant.user.toString(), 'session_ended', {
          chat: chatId
        });
      });

      return chat;
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }
}

export default new ChatService();
