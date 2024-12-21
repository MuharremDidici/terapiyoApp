import { validationResult } from 'express-validator';
import messagingService from '../services/messaging.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class MessagingController {
  /**
   * Create chat
   * @route POST /api/v1/messaging/chats
   */
  createChat = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const chat = await messagingService.createChat(
      req.user.id,
      req.body.type,
      req.body.participants,
      req.body.metadata
    );

    res.status(201).json({
      status: 'success',
      data: chat
    });
  });

  /**
   * Get chats
   * @route GET /api/v1/messaging/chats
   */
  getChats = catchAsync(async (req, res) => {
    const chats = await messagingService.getChats(
      req.user.id,
      {
        type: req.query.type
      }
    );

    res.json({
      status: 'success',
      data: chats
    });
  });

  /**
   * Get chat by ID
   * @route GET /api/v1/messaging/chats/:id
   */
  getChatById = catchAsync(async (req, res) => {
    const chat = await messagingService.getChatById(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: chat
    });
  });

  /**
   * Send message
   * @route POST /api/v1/messaging/chats/:id/messages
   */
  sendMessage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const message = await messagingService.sendMessage(
      req.params.id,
      req.user.id,
      {
        type: req.body.type,
        content: req.body.content,
        metadata: req.body.metadata,
        file: req.file
      }
    );

    res.status(201).json({
      status: 'success',
      data: message
    });
  });

  /**
   * Get messages
   * @route GET /api/v1/messaging/chats/:id/messages
   */
  getMessages = catchAsync(async (req, res) => {
    const messages = await messagingService.getMessages(
      req.params.id,
      req.user.id,
      {
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        before: req.query.before
      }
    );

    res.json({
      status: 'success',
      data: messages
    });
  });

  /**
   * Edit message
   * @route PATCH /api/v1/messaging/messages/:id
   */
  editMessage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const message = await messagingService.editMessage(
      req.params.id,
      req.user.id,
      req.body.content
    );

    res.json({
      status: 'success',
      data: message
    });
  });

  /**
   * Delete message
   * @route DELETE /api/v1/messaging/messages/:id
   */
  deleteMessage = catchAsync(async (req, res) => {
    const message = await messagingService.deleteMessage(
      req.params.id,
      req.user.id,
      req.query.forEveryone === 'true'
    );

    res.json({
      status: 'success',
      data: message
    });
  });

  /**
   * Create notification
   * @route POST /api/v1/messaging/notifications
   */
  createNotification = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const notification = await messagingService.createNotification(
      req.body.recipient,
      req.body.type,
      req.body.data,
      req.body.options
    );

    res.status(201).json({
      status: 'success',
      data: notification
    });
  });

  /**
   * Get notifications
   * @route GET /api/v1/messaging/notifications
   */
  getNotifications = catchAsync(async (req, res) => {
    const notifications = await messagingService.getNotifications(
      req.user.id,
      {
        type: req.query.type,
        status: req.query.status,
        limit: parseInt(req.query.limit)
      }
    );

    res.json({
      status: 'success',
      data: notifications
    });
  });
}

export default new MessagingController();
