import { Router } from 'express';
import { body, query, param } from 'express-validator';
import localizationController from '../controllers/localization.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Dil rotaları
 */
router.post(
  '/languages',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    body('code').isString().isLength({ min: 2, max: 5 }),
    body('name').isString().notEmpty(),
    body('nativeName').isString().notEmpty(),
    body('direction').optional().isIn(['ltr', 'rtl']),
    body('active').optional().isBoolean(),
    body('default').optional().isBoolean(),
    body('fallback').optional().isString(),
    body('metadata').optional().isObject()
  ],
  localizationController.createLanguage
);

router.put(
  '/languages/:code',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    param('code').isString().isLength({ min: 2, max: 5 }),
    body('name').optional().isString(),
    body('nativeName').optional().isString(),
    body('direction').optional().isIn(['ltr', 'rtl']),
    body('active').optional().isBoolean(),
    body('default').optional().isBoolean(),
    body('fallback').optional().isString(),
    body('metadata').optional().isObject()
  ],
  localizationController.updateLanguage
);

router.post(
  '/languages/:code/default',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    param('code').isString().isLength({ min: 2, max: 5 })
  ],
  localizationController.setDefaultLanguage
);

router.get(
  '/languages',
  authenticate,
  [
    query('active').optional().isBoolean(),
    query('default').optional().isBoolean()
  ],
  localizationController.getLanguages
);

/**
 * Çeviri Anahtarı rotaları
 */
router.post(
  '/keys',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    body('key').isString().notEmpty(),
    body('description').optional().isString(),
    body('category').isString().notEmpty(),
    body('platform').optional().isIn(['web', 'mobile', 'all']),
    body('type').optional().isIn(['text', 'html', 'array', 'object']),
    body('maxLength').optional().isInt(),
    body('variables').optional().isArray(),
    body('tags').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  localizationController.createTranslationKey
);

router.put(
  '/keys/:keyId',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    param('keyId').isMongoId(),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('platform').optional().isIn(['web', 'mobile', 'all']),
    body('type').optional().isIn(['text', 'html', 'array', 'object']),
    body('maxLength').optional().isInt(),
    body('variables').optional().isArray(),
    body('tags').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  localizationController.updateTranslationKey
);

router.get(
  '/keys',
  authenticate,
  [
    query('category').optional().isString(),
    query('platform').optional().isIn(['web', 'mobile', 'all']),
    query('type').optional().isIn(['text', 'html', 'array', 'object']),
    query('tags').optional().isArray(),
    query('search').optional().isString()
  ],
  localizationController.getTranslationKeys
);

/**
 * Çeviri rotaları
 */
router.post(
  '/translations',
  authenticate,
  authorize(['admin', 'translator']),
  [
    body('key').isMongoId(),
    body('language').isString().isLength({ min: 2, max: 5 }),
    body('value').notEmpty(),
    body('status').optional().isIn(['draft', 'review', 'approved', 'published'])
  ],
  localizationController.createTranslation
);

router.put(
  '/translations/:translationId',
  authenticate,
  authorize(['admin', 'translator']),
  [
    param('translationId').isMongoId(),
    body('value').notEmpty(),
    body('comment').optional().isString()
  ],
  localizationController.updateTranslation
);

router.post(
  '/translations/:translationId/approve',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    param('translationId').isMongoId()
  ],
  localizationController.approveTranslation
);

router.post(
  '/translations/:translationId/publish',
  authenticate,
  authorize(['admin', 'translator_manager']),
  [
    param('translationId').isMongoId()
  ],
  localizationController.publishTranslation
);

router.get(
  '/translations',
  authenticate,
  [
    query('key').optional().isMongoId(),
    query('language').optional().isString(),
    query('status').optional().isIn(['draft', 'review', 'approved', 'published']),
    query('translator').optional().isMongoId(),
    query('reviewer').optional().isMongoId()
  ],
  localizationController.getTranslations
);

/**
 * İçerik rotaları
 */
router.post(
  '/content',
  authenticate,
  authorize(['admin', 'content_manager']),
  [
    body('identifier').isString().notEmpty(),
    body('type').isIn(['page', 'email', 'notification', 'document', 'custom']),
    body('title').isObject(),
    body('content').isObject(),
    body('status').optional().isIn(['draft', 'review', 'published']),
    body('metadata').optional().isObject()
  ],
  localizationController.createContent
);

router.put(
  '/content/:identifier',
  authenticate,
  authorize(['admin', 'content_manager']),
  [
    param('identifier').isString(),
    body('title').optional().isObject(),
    body('content').optional().isObject(),
    body('status').optional().isIn(['draft', 'review', 'published']),
    body('metadata').optional().isObject()
  ],
  localizationController.updateContent
);

router.get(
  '/content/:identifier',
  [
    param('identifier').isString(),
    query('language').optional().isString().isLength({ min: 2, max: 5 })
  ],
  localizationController.getContent
);

/**
 * Çeviri Alma rotası
 */
router.get(
  '/t/:key',
  [
    param('key').isString(),
    query('language').optional().isString().isLength({ min: 2, max: 5 }),
    query('variables').optional().isObject()
  ],
  localizationController.getTranslation
);

/**
 * İstatistik rotası
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'translator_manager']),
  localizationController.getStats
);

export default router;
