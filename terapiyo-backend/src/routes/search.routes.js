import { Router } from 'express';
import { query } from 'express-validator';
import searchController from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * @swagger
 * /search/therapists:
 *   get:
 *     tags: [Search]
 *     summary: Terapist arama
 */
router.get(
  '/therapists',
  [
    query('q').optional().isString(),
    query('filters').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn([
      'relevance',
      'rating',
      'price_asc',
      'price_desc',
      'experience',
      'distance'
    ]),
    query('lat').optional().isFloat(),
    query('lon').optional().isFloat(),
    query('city').optional().isString(),
    query('country').optional().isString()
  ],
  searchController.searchTherapists
);

/**
 * @swagger
 * /search/content:
 *   get:
 *     tags: [Search]
 *     summary: İçerik arama
 */
router.get(
  '/content',
  [
    query('q').optional().isString(),
    query('filters').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['relevance', 'date'])
  ],
  searchController.searchContent
);

/**
 * @swagger
 * /search/suggestions:
 *   get:
 *     tags: [Search]
 *     summary: Arama önerileri
 */
router.get(
  '/suggestions',
  [
    query('q').isString(),
    query('type').optional().isIn(['all', 'therapist', 'content'])
  ],
  searchController.getSearchSuggestions
);

/**
 * @swagger
 * /search/popular:
 *   get:
 *     tags: [Search]
 *     summary: Popüler aramalar
 */
router.get(
  '/popular',
  [
    query('category').optional().isIn(['specialty', 'problem', 'location', 'other'])
  ],
  searchController.getPopularSearches
);

/**
 * @swagger
 * /search/history:
 *   get:
 *     tags: [Search]
 *     summary: Arama geçmişi
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/history',
  authenticate,
  searchController.getSearchHistory
);

/**
 * @swagger
 * /search/history:
 *   delete:
 *     tags: [Search]
 *     summary: Arama geçmişini temizle
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/history',
  authenticate,
  searchController.clearSearchHistory
);

/**
 * @swagger
 * /search/reindex:
 *   post:
 *     tags: [Search]
 *     summary: Tüm verileri yeniden indeksle
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/reindex',
  authenticate,
  authorize(['admin']),
  searchController.reindexAll
);

export default router;
