import { Router } from 'express';
import { body, query, param } from 'express-validator';
import messagingController from '../controllers/messaging.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * Chat routes
 */
router.post(
  '/chats',
  authenticate,
  [
    body('type').isIn(['individual', 'group', 'channel', 'support']),
    body('participants').isArray().notEmpty(),
    body('participants.*.user').isMongoId(),
    body('participants.*.role').optional().isIn(['admin', 'moderator', 'member']),
    body('metadata').optional().isObject()
  ],
  messagingController.createChat
);

router.get(
  '/chats',
  authenticate,
  [
    query('type').optional().isIn(['individual', 'group', 'channel', 'support'])
  ],
  messagingController.getChats
);

router.get(
  '/chats/:id',
  authenticate,
  [
    param('id').isMongoId()
  ],
  messagingController.getChatById
);

/**
 * Message routes
 */
router.post(
  '/chats/:id/messages',
  authenticate,
  upload.single('file'),
  [
    param('id').isMongoId(),
    body('type').isIn(['text', 'image', 'file', 'audio', 'video', 'location']),
    body('content').custom((value, { req }) => {
      if (req.body.type === 'text' && (!value || !value.text)) {
        throw new Error('Text content is required for text messages');
      }
      if (req.body.type !== 'text' && !req.file) {
        throw new Error('File is required for non-text messages');
      }
      return true;
    }),
    body('metadata').optional().isObject()
  ],
  messagingController.sendMessage
);

router.get(
  '/chats/:id/messages',
  authenticate,
  [
    param('id').isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('before').optional().isISO8601()
  ],
  messagingController.getMessages
);

router.patch(
  '/messages/:id',
  authenticate,
  [
    param('id').isMongoId(),
    body('content').isString().trim().notEmpty()
  ],
  messagingController.editMessage
);

router.delete(
  '/messages/:id',
  authenticate,
  [
    param('id').isMongoId(),
    query('forEveryone').optional().isBoolean()
  ],
  messagingController.deleteMessage
);

/**
 * Notification routes
 */
router.post(
  '/notifications',
  authenticate,
  [
    body('recipient').isMongoId(),
    body('type').isIn([
      'message',
      'mention',
      'reaction',
      'appointment',
      'payment',
      'review',
      'document',
      'system'
    ]),
    body('data').isObject(),
    body('data.title').isString().trim().notEmpty(),
    body('data.body').isString().trim().notEmpty(),
    body('options').optional().isObject()
  ],
  messagingController.createNotification
);

router.get(
  '/notifications',
  authenticate,
  [
    query('type').optional().isString(),
    query('status').optional().isIn(['unread', 'read', 'archived']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  messagingController.getNotifications
);

export default router;
