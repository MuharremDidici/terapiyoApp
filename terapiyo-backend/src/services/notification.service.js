import { Notification } from '../models/messaging.model.js';
import notificationUtil from '../utils/notification.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class NotificationService {
  /**
   * Create notification
   */
  async createNotification(data) {
    try {
      const notification = await Notification.create(data);

      // Send notification through specified channels
      if (!data.scheduledFor || data.scheduledFor <= new Date()) {
        await this.sendNotification(notification);
      }

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification
   */
  async sendNotification(notification) {
    try {
      const results = await notificationUtil.sendMultiChannel(notification);

      // Update notification status
      for (const [channel, sent] of Object.entries(results)) {
        if (sent) {
          await notification.markAsSent(channel);
        }
      }

      return results;
    } catch (error) {
      logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const {
        read,
        type,
        category,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = filters;

      const query = { recipient: userId };

      if (typeof read === 'boolean') {
        query['status.web.read'] = read;
      }
      if (type) query.type = type;
      if (category) query.category = category;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new ApiError(404, 'Notification not found');
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        {
          recipient: userId,
          'status.web.read': false
        },
        {
          $set: {
            'status.web.read': true,
            'status.web.readAt': new Date()
          }
        }
      );

      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId) {
    try {
      return await notificationUtil.getPreferences(userId);
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      return await notificationUtil.updatePreferences(userId, preferences);
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        throw new ApiError(404, 'Notification not found');
      }

      return notification;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear old notifications
   */
  async clearOldNotifications(days = 30) {
    try {
      const date = new Date();
      date.setDate(date.getDate() - days);

      await Notification.deleteMany({
        createdAt: { $lt: date }
      });

      return true;
    } catch (error) {
      logger.error('Error clearing old notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();
