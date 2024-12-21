import { Router } from 'express';
import { body, param } from 'express-validator';
import recommendationController from '../controllers/recommendation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Preference routes
 */
router.patch(
  '/preferences',
  authenticate,
  [
    body('categories').optional().isArray(),
    body('categories.*.category').isIn([
      'anxiety',
      'depression',
      'relationships',
      'stress',
      'trauma',
      'addiction',
      'family',
      'career',
      'personal_growth',
      'other'
    ]),
    body('categories.*.weight').optional().isFloat({ min: 0, max: 1 }),
    body('specialties').optional().isArray(),
    body('specialties.*.specialty').isString(),
    body('specialties.*.weight').optional().isFloat({ min: 0, max: 1 }),
    body('therapistPreferences').optional().isObject(),
    body('therapistPreferences.gender').optional().isString(),
    body('therapistPreferences.ageRange').optional().isObject(),
    body('therapistPreferences.experience').optional().isIn([
      'entry',
      'intermediate',
      'senior',
      'expert'
    ]),
    body('therapistPreferences.language').optional().isArray(),
    body('therapistPreferences.sessionType').optional().isIn([
      'video',
      'voice',
      'chat',
      'in_person'
    ]),
    body('therapistPreferences.availability').optional().isIn([
      'morning',
      'afternoon',
      'evening',
      'weekend'
    ])
  ],
  recommendationController.updatePreferences
);

router.get(
  '/preferences',
  authenticate,
  recommendationController.getPreferences
);

/**
 * Recommendation routes
 */
router.post(
  '/',
  authenticate,
  [
    body('categories').optional().isArray(),
    body('specialties').optional().isArray(),
    body('availability').optional().isArray(),
    body('priceRange').optional().isObject(),
    body('priceRange.min').optional().isNumeric(),
    body('priceRange.max').optional().isNumeric(),
    body('location').optional().isObject(),
    body('location.coordinates').optional().isArray().isLength({ min: 2, max: 2 }),
    body('radius').optional().isNumeric(),
    body('force').optional().isBoolean()
  ],
  recommendationController.generateRecommendations
);

/**
 * Feedback routes
 */
router.post(
  '/:id/feedback',
  authenticate,
  [
    param('id').isMongoId(),
    body('therapistId').isMongoId(),
    body('action').isIn(['view', 'click', 'book', 'ignore']),
    body('position').optional().isInt({ min: 0 })
  ],
  recommendationController.recordFeedback
);

router.patch(
  '/feedback/:id/outcome',
  authenticate,
  [
    param('id').isMongoId(),
    body('booked').optional().isBoolean(),
    body('completed').optional().isBoolean(),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('feedback').optional().isString()
  ],
  recommendationController.updateSessionOutcome
);

export default router;
