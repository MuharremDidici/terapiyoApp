import { validationResult } from 'express-validator';
import seoService from '../services/seo.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class SeoController {
  /**
   * SEO Settings endpoints
   */
  updateSeoSettings = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const settings = await seoService.updateSeoSettings(
      req.params.route,
      req.body
    );

    res.json({
      status: 'success',
      data: settings
    });
  });

  getSeoSettings = catchAsync(async (req, res) => {
    const settings = await seoService.getSeoSettings(req.params.route);

    res.json({
      status: 'success',
      data: settings
    });
  });

  /**
   * Performance Monitoring endpoints
   */
  recordPerformanceMetrics = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const metrics = await seoService.recordPerformanceMetrics(req.body);

    res.status(201).json({
      status: 'success',
      data: metrics
    });
  });

  getPerformanceMetrics = catchAsync(async (req, res) => {
    const metrics = await seoService.getPerformanceMetrics(
      req.params.route,
      req.query.timeRange
    );

    res.json({
      status: 'success',
      data: metrics
    });
  });

  /**
   * Cache Configuration endpoints
   */
  updateCacheConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const config = await seoService.updateCacheConfig(
      req.params.route,
      req.body
    );

    res.json({
      status: 'success',
      data: config
    });
  });

  getCacheConfig = catchAsync(async (req, res) => {
    const config = await seoService.getCacheConfig(req.params.route);

    res.json({
      status: 'success',
      data: config
    });
  });

  /**
   * Compression Configuration endpoints
   */
  updateCompressionConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const config = await seoService.updateCompressionConfig(
      req.params.route,
      req.body
    );

    res.json({
      status: 'success',
      data: config
    });
  });

  getCompressionConfig = catchAsync(async (req, res) => {
    const config = await seoService.getCompressionConfig(req.params.route);

    res.json({
      status: 'success',
      data: config
    });
  });

  /**
   * Image Optimization endpoints
   */
  optimizeImage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { imageUrl, options } = req.body;
    const optimizedImage = await seoService.optimizeImage(imageUrl, options);

    res.status(201).json({
      status: 'success',
      data: optimizedImage
    });
  });

  getOptimizedImage = catchAsync(async (req, res) => {
    const { imageUrl, width, height, format } = req.query;
    const optimizedImage = await seoService.getOptimizedImage(
      imageUrl,
      parseInt(width),
      parseInt(height),
      format
    );

    res.json({
      status: 'success',
      data: optimizedImage
    });
  });

  /**
   * Sitemap endpoints
   */
  generateSitemap = catchAsync(async (req, res) => {
    const sitemap = await seoService.generateSitemap();

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });
}

export default new SeoController();
