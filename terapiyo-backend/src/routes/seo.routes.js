import { Router } from 'express';
import { body, param, query } from 'express-validator';
import seoController from '../controllers/seo.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

/**
 * SEO Settings routes
 */
router.patch(
  '/settings/:route',
  authenticate,
  authorize(['admin']),
  [
    param('route').isString().notEmpty(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('keywords').optional().isArray(),
    body('metaTags').optional().isArray(),
    body('canonicalUrl').optional().isURL(),
    body('structuredData').optional().isArray(),
    body('robots').optional().isIn([
      'index,follow',
      'noindex,follow',
      'index,nofollow',
      'noindex,nofollow'
    ]),
    body('priority').optional().isFloat({ min: 0, max: 1 }),
    body('changefreq').optional().isIn([
      'always',
      'hourly',
      'daily',
      'weekly',
      'monthly',
      'yearly',
      'never'
    ])
  ],
  seoController.updateSeoSettings
);

router.get(
  '/settings/:route',
  [
    param('route').isString().notEmpty()
  ],
  seoController.getSeoSettings
);

/**
 * Performance Monitoring routes
 */
router.post(
  '/metrics',
  [
    body('route').isString().notEmpty(),
    body('metrics').isObject(),
    body('metrics.ttfb').optional().isNumeric(),
    body('metrics.fcp').optional().isNumeric(),
    body('metrics.lcp').optional().isNumeric(),
    body('metrics.fid').optional().isNumeric(),
    body('metrics.cls').optional().isNumeric(),
    body('metrics.ttl').optional().isNumeric(),
    body('userAgent').optional().isString(),
    body('device').optional().isIn(['mobile', 'tablet', 'desktop']),
    body('connection').optional().isIn(['4g', '3g', '2g', 'slow-2g', 'offline']),
    body('location').optional().isString()
  ],
  seoController.recordPerformanceMetrics
);

router.get(
  '/metrics/:route',
  authenticate,
  [
    param('route').isString().notEmpty(),
    query('timeRange').optional().isNumeric()
  ],
  seoController.getPerformanceMetrics
);

/**
 * Cache Configuration routes
 */
router.patch(
  '/cache/:route',
  authenticate,
  authorize(['admin']),
  [
    param('route').isString().notEmpty(),
    body('headers').optional().isArray(),
    body('ttl').optional().isNumeric(),
    body('strategy').optional().isIn([
      'network-first',
      'cache-first',
      'stale-while-revalidate'
    ]),
    body('conditions').optional().isObject()
  ],
  seoController.updateCacheConfig
);

router.get(
  '/cache/:route',
  [
    param('route').isString().notEmpty()
  ],
  seoController.getCacheConfig
);

/**
 * Compression Configuration routes
 */
router.patch(
  '/compression/:route',
  authenticate,
  authorize(['admin']),
  [
    param('route').isString().notEmpty(),
    body('enabled').optional().isBoolean(),
    body('level').optional().isInt({ min: 1, max: 9 }),
    body('threshold').optional().isNumeric(),
    body('mimeTypes').optional().isArray()
  ],
  seoController.updateCompressionConfig
);

router.get(
  '/compression/:route',
  [
    param('route').isString().notEmpty()
  ],
  seoController.getCompressionConfig
);

/**
 * Image Optimization routes
 */
router.post(
  '/images/optimize',
  authenticate,
  [
    body('imageUrl').isURL(),
    body('options').optional().isObject()
  ],
  seoController.optimizeImage
);

router.get(
  '/images/optimized',
  [
    query('imageUrl').isURL(),
    query('width').optional().isNumeric(),
    query('height').optional().isNumeric(),
    query('format').optional().isIn(['jpeg', 'png', 'webp', 'avif'])
  ],
  seoController.getOptimizedImage
);

/**
 * Sitemap routes
 */
router.get(
  '/sitemap.xml',
  seoController.generateSitemap
);

export default router;
