import { Router } from 'express';
import { body, query } from 'express-validator';
import contentController from '../controllers/content.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Category routes
 */
router.post(
  '/categories',
  authenticate,
  authorize(['admin', 'editor']),
  [
    body('name').isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('parent').optional().isMongoId(),
    body('order').optional().isInt(),
    body('isActive').optional().isBoolean(),
    body('metadata').optional().isObject()
  ],
  contentController.createCategory
);

router.get(
  '/categories',
  [
    query('includeInactive').optional().isBoolean()
  ],
  contentController.getCategories
);

router.patch(
  '/categories/:id',
  authenticate,
  authorize(['admin', 'editor']),
  [
    body('name').optional().isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('parent').optional().isMongoId(),
    body('order').optional().isInt(),
    body('isActive').optional().isBoolean(),
    body('metadata').optional().isObject()
  ],
  contentController.updateCategory
);

/**
 * Tag routes
 */
router.post(
  '/tags',
  authenticate,
  authorize(['admin', 'editor']),
  [
    body('name').isString().trim().notEmpty(),
    body('description').optional().isString()
  ],
  contentController.createTag
);

router.get(
  '/tags',
  contentController.getTags
);

router.patch(
  '/tags/:id',
  authenticate,
  authorize(['admin', 'editor']),
  [
    body('name').optional().isString().trim().notEmpty(),
    body('description').optional().isString()
  ],
  contentController.updateTag
);

/**
 * Article routes
 */
router.post(
  '/articles',
  authenticate,
  authorize(['admin', 'editor', 'therapist']),
  [
    body('title').isString().trim().notEmpty(),
    body('content').isString().notEmpty(),
    body('excerpt').optional().isString().isLength({ max: 500 }),
    body('category').isMongoId(),
    body('tags').optional().isArray(),
    body('tags.*').isMongoId(),
    body('status').isIn(['draft', 'published', 'archived']),
    body('featuredImage').optional().isObject(),
    body('seo').optional().isObject()
  ],
  contentController.createArticle
);

router.get(
  '/articles',
  [
    query('category').optional().isMongoId(),
    query('tags').optional().isString(),
    query('author').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort').optional().isIn(['-publishedAt', '-views', '-likes'])
  ],
  contentController.getArticles
);

router.get(
  '/articles/:slug',
  contentController.getArticle
);

router.patch(
  '/articles/:id',
  authenticate,
  authorize(['admin', 'editor', 'therapist']),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('content').optional().isString().notEmpty(),
    body('excerpt').optional().isString().isLength({ max: 500 }),
    body('category').optional().isMongoId(),
    body('tags').optional().isArray(),
    body('tags.*').isMongoId(),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('featuredImage').optional().isObject(),
    body('seo').optional().isObject()
  ],
  contentController.updateArticle
);

/**
 * Resource routes
 */
router.post(
  '/resources',
  authenticate,
  authorize(['admin', 'editor', 'therapist']),
  [
    body('title').isString().trim().notEmpty(),
    body('type').isIn(['pdf', 'video', 'audio', 'infographic', 'worksheet']),
    body('description').optional().isString(),
    body('content.url').isURL(),
    body('content.duration').optional().isNumeric(),
    body('content.size').optional().isNumeric(),
    body('content.format').optional().isString(),
    body('category').optional().isMongoId(),
    body('tags').optional().isArray(),
    body('tags.*').isMongoId(),
    body('access').isIn(['public', 'registered', 'premium'])
  ],
  contentController.createResource
);

router.get(
  '/resources',
  [
    query('type').optional().isIn(['pdf', 'video', 'audio', 'infographic', 'worksheet']),
    query('category').optional().isMongoId(),
    query('tags').optional().isString(),
    query('access').optional().isIn(['public', 'registered', 'premium']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort').optional().isIn(['-createdAt', '-downloads', '-rating.average'])
  ],
  contentController.getResources
);

router.get(
  '/resources/:slug',
  contentController.getResource
);

router.patch(
  '/resources/:id',
  authenticate,
  authorize(['admin', 'editor', 'therapist']),
  [
    body('title').optional().isString().trim().notEmpty(),
    body('type').optional().isIn(['pdf', 'video', 'audio', 'infographic', 'worksheet']),
    body('description').optional().isString(),
    body('content.url').optional().isURL(),
    body('content.duration').optional().isNumeric(),
    body('content.size').optional().isNumeric(),
    body('content.format').optional().isString(),
    body('category').optional().isMongoId(),
    body('tags').optional().isArray(),
    body('tags.*').isMongoId(),
    body('access').optional().isIn(['public', 'registered', 'premium'])
  ],
  contentController.updateResource
);

/**
 * Comment routes
 */
router.post(
  '/articles/:id/comments',
  authenticate,
  [
    body('content').isString().trim().notEmpty()
  ],
  contentController.addComment
);

router.post(
  '/articles/:id/comments/:commentId/replies',
  authenticate,
  [
    body('content').isString().trim().notEmpty()
  ],
  contentController.addReply
);

router.patch(
  '/articles/:id/comments/:commentId/moderate',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    body('status').isIn(['pending', 'approved', 'rejected'])
  ],
  contentController.moderateComment
);

export default router;
