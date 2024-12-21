import { Router } from 'express';
import { body, query } from 'express-validator';
import chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /chats:
 *   post:
 *     tags: [Chats]
 *     summary: Create new chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCreate'
 */
router.post(
  '/',
  authenticate,
  [
    body('participants').isArray().notEmpty(),
    body('participants.*.user').isMongoId(),
    body('participants.*.role').isIn(['client', 'therapist']),
    body('type').isIn(['session', 'support'])
  ],
  chatController.createChat
);

/**
 * @swagger
 * /chats/{id}:
 *   get:
 *     tags: [Chats]
 *     summary: Get chat by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get(
  '/:id',
  authenticate,
  chatController.getChat
);

/**
 * @swagger
 * /chats:
 *   get:
 *     tags: [Chats]
 *     summary: Get user chats
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authenticate,
  [
    query('status').optional().isIn(['active', 'archived', 'deleted']),
    query('type').optional().isIn(['session', 'support']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  chatController.getUserChats
);

/**
 * @swagger
 * /chats/{id}/messages:
 *   post:
 *     tags: [Chats]
 *     summary: Send message
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/messages',
  authenticate,
  [
    body('content').isString().notEmpty(),
    body('type').isIn(['text', 'image', 'file']),
    body('metadata').optional().isObject()
  ],
  chatController.sendMessage
);

/**
 * @swagger
 * /chats/{id}/messages:
 *   get:
 *     tags: [Chats]
 *     summary: Get chat messages
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/messages',
  authenticate,
  [
    query('before').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  chatController.getChatMessages
);

/**
 * @swagger
 * /chats/{id}/read:
 *   post:
 *     tags: [Chats]
 *     summary: Mark messages as read
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/read',
  authenticate,
  chatController.markAsRead
);

/**
 * @swagger
 * /chats/messages/{id}:
 *   delete:
 *     tags: [Chats]
 *     summary: Delete message
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/messages/:id',
  authenticate,
  chatController.deleteMessage
);

/**
 * @swagger
 * /chats/{id}/session/start:
 *   post:
 *     tags: [Chats]
 *     summary: Start therapy session
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/session/start',
  authenticate,
  chatController.startSession
);

/**
 * @swagger
 * /chats/{id}/session/end:
 *   post:
 *     tags: [Chats]
 *     summary: End therapy session
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/session/end',
  authenticate,
  chatController.endSession
);

export default router;
