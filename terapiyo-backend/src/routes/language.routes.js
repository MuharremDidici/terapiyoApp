import { Router } from 'express';
import { body, query } from 'express-validator';
import languageController from '../controllers/language.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * Translation routes
 */
router.get(
  '/translations',
  [
    query('key').isString().notEmpty(),
    query('language').isString().isLength({ min: 2, max: 5 }),
    query('context').optional().isString()
  ],
  languageController.getTranslation
);

router.post(
  '/translations',
  authenticate,
  authorize(['admin', 'translator']),
  [
    body('key').isString().notEmpty(),
    body('language').isString().isLength({ min: 2, max: 5 }),
    body('value').isString().notEmpty(),
    body('context').optional().isString(),
    body('tags').optional().isArray()
  ],
  languageController.setTranslation
);

/**
 * Language management routes
 */
router.post(
  '/languages',
  authenticate,
  authorize(['admin']),
  [
    body('code').isString().isLength({ min: 2, max: 5 }),
    body('name').isString().notEmpty(),
    body('nativeName').isString().notEmpty(),
    body('direction').optional().isIn(['ltr', 'rtl']),
    body('active').optional().isBoolean(),
    body('defaultFallback').optional().isString(),
    body('metadata').optional().isObject()
  ],
  languageController.addLanguage
);

router.get(
  '/languages',
  languageController.getActiveLanguages
);

/**
 * User language preference routes
 */
router.get(
  '/preferences',
  authenticate,
  languageController.getUserLanguage
);

router.patch(
  '/preferences',
  authenticate,
  [
    body('preferredLanguage').optional().isString(),
    body('fallbackLanguages').optional().isArray(),
    body('autoDetect').optional().isBoolean(),
    body('metadata').optional().isObject()
  ],
  languageController.updateUserLanguage
);

/**
 * Translation utility routes
 */
router.post(
  '/detect-translate',
  [
    body('text').isString().notEmpty(),
    body('targetLanguage').isString().isLength({ min: 2, max: 5 })
  ],
  languageController.detectAndTranslate
);

/**
 * Bulk operation routes
 */
router.post(
  '/bulk-import',
  authenticate,
  authorize(['admin', 'translator']),
  [
    body('translations').isArray(),
    body('translations.*.key').isString().notEmpty(),
    body('translations.*.language').isString().isLength({ min: 2, max: 5 }),
    body('translations.*.value').isString().notEmpty(),
    body('translations.*.context').optional().isString(),
    body('translations.*.tags').optional().isArray()
  ],
  languageController.bulkImportTranslations
);

router.get(
  '/bulk-export',
  authenticate,
  authorize(['admin', 'translator']),
  [
    query('language').isString().isLength({ min: 2, max: 5 }),
    query('context').optional().isString()
  ],
  languageController.bulkExportTranslations
);

export default router;
