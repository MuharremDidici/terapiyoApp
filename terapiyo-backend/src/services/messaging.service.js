import { Message, Chat, Notification } from '../models/messaging.model.js';
import { redis } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { uploadToS3, deleteFromS3 } from '../utils/storage.js';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';
import { sendPushNotification } from '../utils/push-notification.js';
import socketService from '../utils/socket.js';

class MessagingService {
  /**
   * Chat Management
   */
  async createChat(creatorId, type, participants, metadata = {}) {
    try {
      // Validate participants
      if (type === 'individual' && participants.length !== 2) {
        throw new ApiError(400, 'Individual chat must have exactly 2 participants');
      }

      // Check for existing individual chat
      if (type === 'individual') {
        const existingChat = await Chat.findOne({
          type: 'individual',
          'participants.user': { $all: participants.map(p => p.user) },
          status: 'active'
        });

        if (existingChat) {
          return existingChat;
        }
      }

      const chat = await Chat.create({
        type,
        participants: participants.map(p => ({
          user: p.user,
          role: p.role || 'member'
        })),
        metadata
      });

      // Create system message for chat creation
      await this.#createSystemMessage(chat._id, {
        type: 'chat_created',
        data: {
          createdBy: creatorId,
          chatType: type
        }
      });

      return chat;
    } catch (error) {
      logger.error('Chat creation failed:', error);
      throw error;
    }
  }

  async getChats(userId, filters = {}) {
    try {
      const query = {
        'participants.user': userId,
        'participants.isActive': true,
        status: 'active'
      };

      if (filters.type) {
        query.type = filters.type;
      }

      const chats = await Chat.find(query)
        .populate('participants.user', 'firstName lastName avatar')
        .populate('lastMessage')
        .sort('-updatedAt');

      return chats;
    } catch (error) {
      logger.error('Chats retrieval failed:', error);
      throw error;
    }
  }

  async getChatById(chatId, userId) {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': userId,
        status: 'active'
      })
        .populate('participants.user', 'firstName lastName avatar')
        .populate('lastMessage')
        .populate('pinnedMessages');

      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      return chat;
    } catch (error) {
      logger.error('Chat retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Message Management
   */
  async sendMessage(chatId, senderId, messageData) {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': senderId,
        status: 'active'
      });

      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      // Handle file uploads if any
      if (messageData.type !== 'text' && messageData.file) {
        const fileUrl = await uploadToS3(messageData.file, 'chat-files');
        messageData.content = {
          fileUrl,
          fileName: messageData.file.originalname,
          fileSize: messageData.file.size,
          mimeType: messageData.file.mimetype
        };

        if (messageData.type === 'image' || messageData.type === 'video') {
          // Generate thumbnail
          messageData.content.thumbnail = await this.generateThumbnail(fileUrl);
        }
      }

      const message = await Message.create({
        chat: chatId,
        sender: senderId,
        type: messageData.type,
        content: messageData.content,
        metadata: messageData.metadata
      });

      // Update chat's last message
      chat.lastMessage = message._id;
      await chat.save();

      // Send real-time update
      this.#broadcastMessage(message);

      // Send notifications to other participants
      await this.#notifyMessageRecipients(chat, message);

      return message;
    } catch (error) {
      logger.error('Message sending failed:', error);
      throw error;
    }
  }

  async getMessages(chatId, userId, options = {}) {
    try {
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': userId,
        status: 'active'
      });

      if (!chat) {
        throw new ApiError(404, 'Chat not found');
      }

      const {
        page = 1,
        limit = 50,
        before = Date.now()
      } = options;

      const messages = await Message.find({
        chat: chatId,
        createdAt: { $lt: before },
        $or: [
          { isDeleted: false },
          { 'deletedFor.user': { $ne: userId } }
        ]
      })
        .populate('sender', 'firstName lastName avatar')
        .populate('metadata.replyTo')
        .populate('metadata.mentions.user', 'firstName lastName')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit);

      return messages;
    } catch (error) {
      logger.error('Messages retrieval failed:', error);
      throw error;
    }
  }

  async editMessage(messageId, userId, newContent) {
    try {
      const message = await Message.findOne({
        _id: messageId,
        sender: userId,
        isDeleted: false
      });

      if (!message) {
        throw new ApiError(404, 'Message not found');
      }

      // Store original content in edit history
      message.editHistory.push({
        content: message.content.text,
        editedAt: new Date()
      });

      message.content.text = newContent;
      message.isEdited = true;
      await message.save();

      // Broadcast update
      socketService.io.to(message.chat.toString()).emit('message:edited', {
        messageId: message._id,
        newContent,
        editedAt: new Date()
      });

      return message;
    } catch (error) {
      logger.error('Message edit failed:', error);
      throw error;
    }
  }

  async deleteMessage(messageId, userId, forEveryone = false) {
    try {
      const message = await Message.findOne({
        _id: messageId,
        $or: [
          { sender: userId },
          { 'chat.participants.user': userId }
        ]
      });

      if (!message) {
        throw new ApiError(404, 'Message not found');
      }

      if (forEveryone && message.sender.equals(userId)) {
        message.isDeleted = true;
        message.deletedAt = new Date();

        // Delete associated files if any
        if (message.content.fileUrl) {
          await deleteFromS3(message.content.fileUrl);
        }
      } else {
        message.deletedFor.push({
          user: userId
        });
      }

      await message.save();

      // Broadcast deletion
      if (forEveryone) {
        socketService.io.to(message.chat.toString()).emit('message:deleted', {
          messageId: message._id,
          deletedAt: new Date()
        });
      }

      return message;
    } catch (error) {
      logger.error('Message deletion failed:', error);
      throw error;
    }
  }

  /**
   * Notification Management
   */
  async createNotification(recipientId, type, data, options = {}) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        title: data.title,
        body: data.body,
        data,
        priority: options.priority || 'normal',
        channels: options.channels || ['in_app'],
        expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      // Send notifications through specified channels
      await this.#sendNotificationThroughChannels(notification);

      return notification;
    } catch (error) {
      logger.error('Notification creation failed:', error);
      throw error;
    }
  }

  async getNotifications(userId, filters = {}) {
    try {
      const query = {
        recipient: userId,
        status: { $ne: 'archived' }
      };

      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.status) {
        query.status = filters.status;
      }

      const notifications = await Notification.find(query)
        .sort('-createdAt')
        .limit(filters.limit || 50);

      return notifications;
    } catch (error) {
      logger.error('Notifications retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  async #createSystemMessage(chatId, systemData) {
    try {
      const message = await Message.create({
        chat: chatId,
        type: 'system',
        systemData
      });

      return message;
    } catch (error) {
      logger.error('System message creation failed:', error);
      throw error;
    }
  }

  async #notifyMessageRecipients(chat, message) {
    try {
      const notification = {
        title: 'Yeni Mesaj',
        body: message.content,
        data: {
          chatId: chat._id,
          messageId: message._id,
          senderId: message.sender,
          type: message.type
        }
      };

      // Tüm katılımcılara bildirim gönder
      await Promise.all(
        chat.participants
          .filter(participant => !participant._id.equals(message.sender))
          .map(participant => this.#sendNotificationThroughChannels(participant._id, notification))
      );
    } catch (error) {
      logger.error('Message notification failed:', error);
    }
  }

  async #sendNotificationThroughChannels(userId, notification) {
    try {
      // Kullanıcının bildirim tercihlerini kontrol et
      const preferences = await this.#getNotificationPreferences(userId);

      // Her kanal için bildirim gönder
      if (preferences.push) {
        await sendPushNotification(userId, notification);
      }
      if (preferences.email) {
        await sendEmail(userId, 'new-message', notification);
      }
      if (preferences.sms) {
        await sendSMS(userId, 'new-message', notification);
      }
    } catch (error) {
      logger.error('Notification through channels failed:', error);
    }
  }

  async #broadcastMessage(message) {
    try {
      // Mesajı tüm bağlı istemcilere yayınla
      socketService.io.emit('broadcast', {
        type: message.type,
        content: message.content,
        timestamp: message.createdAt
      });

      return true;
    } catch (error) {
      logger.error('Message broadcast failed:', error);
      return false;
    }
  }

  async #getNotificationPreferences(userId) {
    // Varsayılan tercihler
    return {
      push: true,
      email: true,
      sms: false
    };
  }
}

export default new MessagingService();
