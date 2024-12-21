import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { redis } from '../config/database.js';
import logger from '../config/logger.js';
import { loadTemplate, compileTemplate } from './template.js';
import { emitSocketEvent } from './socket.js';

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Initialize SMS client (optional)
let smsClient = null;
// SMS özelliği şimdilik devre dışı
// if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
//   const twilio = await import('twilio');
//   smsClient = twilio.default(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
// }

// Initialize web push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  /**
   * Send email notification
   */
  async sendEmail(to, subject, template, data) {
    try {
      const htmlTemplate = await loadTemplate(template);
      const html = compileTemplate(htmlTemplate, data);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      await emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(to, message) {
    try {
      if (!smsClient) {
        logger.warn('SMS client not configured');
        return false;
      }

      await smsClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });
      logger.info(`SMS sent to ${to}`);
      return true;
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  async sendPush(subscription, title, message, data = {}) {
    try {
      const payload = JSON.stringify({
        title,
        message,
        ...data
      });

      await webpush.sendNotification(subscription, payload);
      logger.info('Push notification sent');
      return true;
    } catch (error) {
      logger.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send web notification (via Socket.IO)
   */
  async sendWebNotification(userId, notification) {
    try {
      emitSocketEvent(userId, 'notification', notification);
      logger.info(`Web notification sent to user ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error sending web notification:', error);
      return false;
    }
  }

  /**
   * Send notification through multiple channels
   */
  async sendMultiChannel(notification) {
    const { recipient, channels, title, message, data, template } = notification;

    // Get user details from cache or database
    const userKey = `user:${recipient}`;
    let user = await redis.get(userKey);
    if (!user) {
      // Fetch from database and cache
      user = await User.findById(recipient).select('email phone pushSubscription preferences');
      await redis.set(userKey, JSON.stringify(user), 'EX', 3600);
    } else {
      user = JSON.parse(user);
    }

    const results = {
      web: false,
      email: false,
      push: false,
      sms: false
    };

    // Send through each channel
    for (const channel of channels) {
      switch (channel) {
        case 'web':
          results.web = await this.sendWebNotification(recipient, {
            title,
            message,
            data
          });
          break;

        case 'email':
          if (user.email && user.preferences?.emailNotifications) {
            results.email = await this.sendEmail(
              user.email,
              title,
              template || 'default',
              { message, ...data }
            );
          }
          break;

        case 'push':
          if (user.pushSubscription && user.preferences?.pushNotifications) {
            results.push = await this.sendPush(
              user.pushSubscription,
              title,
              message,
              data
            );
          }
          break;

        case 'sms':
          if (user.phone && user.preferences?.smsNotifications) {
            results.sms = await this.sendSMS(user.phone, message);
          }
          break;
      }
    }

    return results;
  }
}

// Export instance and utility functions
const notificationService = new NotificationService();
export default notificationService;

export const sendNotification = (notification) => notificationService.sendMultiChannel(notification);
export const sendEmail = (to, subject, template, data) => notificationService.sendEmail(to, subject, template, data);
export const sendSMS = (to, message) => notificationService.sendSMS(to, message);
export const sendPush = (subscription, title, message, data) => notificationService.sendPush(subscription, title, message, data);
export const sendWebNotification = (userId, notification) => notificationService.sendWebNotification(userId, notification);
