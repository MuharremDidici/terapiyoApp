import { validationResult } from 'express-validator';
import chatService from '../services/chat.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class ChatController {
  /**
   * Create new chat
   * @route POST /api/v1/chats
   */
  createChat = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const chat = await chatService.createChat({
      ...req.body,
      participants: [
        { user: req.user.id, role: req.user.role },
        ...req.body.participants
      ]
    });

    res.status(201).json({
      status: 'success',
      data: chat
    });
  });

  /**
   * Get chat by ID
   * @route GET /api/v1/chats/:id
   */
  getChat = catchAsync(async (req, res) => {
    const chat = await chatService.getChat(req.params.id, req.user.id);

    res.json({
      status: 'success',
      data: chat
    });
  });

  /**
   * Get user chats
   * @route GET /api/v1/chats
   */
  getUserChats = catchAsync(async (req, res) => {
    const result = await chatService.getUserChats(req.user.id, req.query);

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Send message
   * @route POST /api/v1/chats/:id/messages
   */
  sendMessage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const message = await chatService.sendMessage(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: message
    });
  });

  /**
   * Get chat messages
   * @route GET /api/v1/chats/:id/messages
   */
  getChatMessages = catchAsync(async (req, res) => {
    const messages = await chatService.getChatMessages(
      req.params.id,
      req.user.id,
      req.query
    );

    res.json({
      status: 'success',
      data: messages
    });
  });

  /**
   * Mark messages as read
   * @route POST /api/v1/chats/:id/read
   */
  markAsRead = catchAsync(async (req, res) => {
    const chat = await chatService.markAsRead(req.params.id, req.user.id);

    res.json({
      status: 'success',
      data: chat
    });
  });

  /**
   * Delete message
   * @route DELETE /api/v1/chats/messages/:id
   */
  deleteMessage = catchAsync(async (req, res) => {
    const message = await chatService.deleteMessage(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: message
    });
  });

  /**
   * Start therapy session
   * @route POST /api/v1/chats/:id/session/start
   */
  startSession = catchAsync(async (req, res) => {
    const chat = await chatService.startSession(req.params.id, req.user.id);

    res.json({
      status: 'success',
      data: chat
    });
  });

  /**
   * End therapy session
   * @route POST /api/v1/chats/:id/session/end
   */
  endSession = catchAsync(async (req, res) => {
    const chat = await chatService.endSession(req.params.id, req.user.id);

    res.json({
      status: 'success',
      data: chat
    });
  });
}

export default new ChatController();
