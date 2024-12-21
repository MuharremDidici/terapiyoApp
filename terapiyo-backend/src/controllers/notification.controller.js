import { validationResult } from 'express-validator';
import notificationService from '../services/notification.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class NotificationController {
  /**
   * Get user notifications
   * @route GET /api/v1/notifications
   */
  getUserNotifications = catchAsync(async (req, res) => {
    const result = await notificationService.getUserNotifications(
      req.user.id,
      req.query
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Mark notification as read
   * @route PATCH /api/v1/notifications/:id/read
   */
  markAsRead = catchAsync(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: notification
    });
  });

  /**
   * Mark all notifications as read
   * @route POST /api/v1/notifications/read-all
   */
  markAllAsRead = catchAsync(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);

    res.json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  });

  /**
   * Get notification preferences
   * @route GET /api/v1/notifications/preferences
   */
  getPreferences = catchAsync(async (req, res) => {
    const preferences = await notificationService.getPreferences(req.user.id);

    res.json({
      status: 'success',
      data: preferences
    });
  });

  /**
   * Update notification preferences
   * @route PATCH /api/v1/notifications/preferences
   */
  updatePreferences = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const preferences = await notificationService.updatePreferences(
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: preferences
    });
  });

  /**
   * Delete notification
   * @route DELETE /api/v1/notifications/:id
   */
  deleteNotification = catchAsync(async (req, res) => {
    await notificationService.deleteNotification(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      message: 'Notification deleted'
    });
  });
}

export default new NotificationController();
