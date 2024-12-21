import logger from '../config/logger.js';
import socketService from './socket.js';

/**
 * Push bildirimi gönder
 */
export const sendPushNotification = async (userId, notification) => {
  try {
    // Socket.io ile bildirimi gönder
    socketService.io.to(userId).emit('notification', {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      timestamp: new Date()
    });

    logger.info(`Push notification sent to user: ${userId}`);
    return true;
  } catch (error) {
    logger.error('Push notification failed:', error);
    return false;
  }
};

/**
 * Toplu push bildirimi gönder
 */
export const sendBulkPushNotification = async (userIds, notification) => {
  try {
    // Her kullanıcı için bildirimi gönder
    const results = await Promise.all(
      userIds.map(userId => sendPushNotification(userId, notification))
    );

    const successCount = results.filter(result => result === true).length;
    logger.info(`Bulk push notification results: ${successCount}/${userIds.length} success`);
    return successCount > 0;
  } catch (error) {
    logger.error('Bulk push notification failed:', error);
    return false;
  }
};

/**
 * Gruba push bildirimi gönder
 */
export const sendGroupPushNotification = async (group, notification) => {
  try {
    // Socket.io ile grup odasına bildirimi gönder
    socketService.io.to(group).emit('notification', {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      timestamp: new Date()
    });

    logger.info(`Group push notification sent to: ${group}`);
    return true;
  } catch (error) {
    logger.error('Group push notification failed:', error);
    return false;
  }
};
