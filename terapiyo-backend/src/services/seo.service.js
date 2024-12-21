import {
  SeoSetting,
  SeoPerformanceMetric,
  CacheConfig,
  CompressionConfig,
  ImageOptimization
} from '../models/seo.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { optimizeImage } from '../utils/seo/image-optimizer.js';
import { generateSitemap } from '../utils/seo/sitemap-generator.js';
import { measurePerformance } from '../utils/seo/performance-monitor.js';

class SeoService {
  /**
   * SEO Settings Management
   */
  async updateSeoSettings(route, settings) {
    try {
      let seoSetting = await SeoSetting.findOne({ route });

      if (!seoSetting) {
        seoSetting = new SeoSetting({
          route,
          ...settings
        });
      } else {
        Object.assign(seoSetting, settings);
      }

      seoSetting.lastmod = new Date();
      await seoSetting.save();

      // Invalidate cache
      await redis.del(`seo:${route}`);

      return seoSetting;
    } catch (error) {
      logger.error('SEO settings update failed:', error);
      throw error;
    }
  }

  async getSeoSettings(route) {
    try {
      // Check cache
      const cachedSettings = await redis.get(`seo:${route}`);
      if (cachedSettings) {
        return JSON.parse(cachedSettings);
      }

      const settings = await SeoSetting.findOne({ route });
      if (!settings) {
        throw new ApiError(404, 'SEO settings not found');
      }

      // Cache settings
      await redis.setex(
        `seo:${route}`,
        3600, // 1 hour
        JSON.stringify(settings)
      );

      return settings;
    } catch (error) {
      logger.error('SEO settings retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Performance Monitoring
   */
  async recordPerformanceMetrics(metrics) {
    try {
      const performanceMetric = new SeoPerformanceMetric(metrics);
      await performanceMetric.save();

      // Update route average metrics
      await this.#updateRouteAverageMetrics(metrics.route);

      return performanceMetric;
    } catch (error) {
      logger.error('Performance metrics recording failed:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(route, timeRange) {
    try {
      const query = { route };
      
      if (timeRange) {
        query.timestamp = {
          $gte: new Date(Date.now() - timeRange)
        };
      }

      return SeoPerformanceMetric.find(query)
        .sort('-timestamp')
        .limit(100);
    } catch (error) {
      logger.error('Performance metrics retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Cache Configuration
   */
  async updateCacheConfig(route, config) {
    try {
      let cacheConfig = await CacheConfig.findOne({ route });

      if (!cacheConfig) {
        cacheConfig = new CacheConfig({
          route,
          ...config
        });
      } else {
        Object.assign(cacheConfig, config);
      }

      await cacheConfig.save();

      // Invalidate cache
      await redis.del(`cache-config:${route}`);

      return cacheConfig;
    } catch (error) {
      logger.error('Cache config update failed:', error);
      throw error;
    }
  }

  async getCacheConfig(route) {
    try {
      // Check cache
      const cachedConfig = await redis.get(`cache-config:${route}`);
      if (cachedConfig) {
        return JSON.parse(cachedConfig);
      }

      const config = await CacheConfig.findOne({ route });
      if (!config) {
        throw new ApiError(404, 'Cache config not found');
      }

      // Cache config
      await redis.setex(
        `cache-config:${route}`,
        3600, // 1 hour
        JSON.stringify(config)
      );

      return config;
    } catch (error) {
      logger.error('Cache config retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Compression Configuration
   */
  async updateCompressionConfig(route, config) {
    try {
      let compressionConfig = await CompressionConfig.findOne({ route });

      if (!compressionConfig) {
        compressionConfig = new CompressionConfig({
          route,
          ...config
        });
      } else {
        Object.assign(compressionConfig, config);
      }

      await compressionConfig.save();

      return compressionConfig;
    } catch (error) {
      logger.error('Compression config update failed:', error);
      throw error;
    }
  }

  async getCompressionConfig(route) {
    try {
      return CompressionConfig.findOne({ route });
    } catch (error) {
      logger.error('Compression config retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Image Optimization
   */
  async optimizeImage(imageUrl, options) {
    try {
      let imageOpt = await ImageOptimization.findOne({
        originalUrl: imageUrl
      });

      if (!imageOpt) {
        imageOpt = new ImageOptimization({
          originalUrl: imageUrl,
          status: 'pending'
        });
        await imageOpt.save();
      }

      // Start optimization process
      const optimizedVersions = await this.#optimizeImageWithSharp(imageUrl, options);

      // Update image optimization record
      imageOpt.optimizedVersions = optimizedVersions;
      imageOpt.status = 'completed';
      await imageOpt.save();

      return imageOpt;
    } catch (error) {
      logger.error('Image optimization failed:', error);
      throw error;
    }
  }

  async getOptimizedImage(imageUrl, width, height, format) {
    try {
      const imageOpt = await ImageOptimization.findOne({
        originalUrl: imageUrl,
        status: 'completed'
      });

      if (!imageOpt) {
        throw new ApiError(404, 'Optimized image not found');
      }

      // Find best matching version
      const version = imageOpt.optimizedVersions.find(v =>
        v.width === width &&
        v.height === height &&
        v.format === format
      );

      if (!version) {
        throw new ApiError(404, 'Requested version not found');
      }

      return version;
    } catch (error) {
      logger.error('Optimized image retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Sitemap Generation
   */
  async generateSitemap() {
    try {
      const routes = await SeoSetting.find()
        .sort('-priority')
        .select('route priority changefreq lastmod');

      const sitemapXml = await this.#generateSitemapXml(routes);
      return sitemapXml;
    } catch (error) {
      logger.error('Sitemap generation failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  async #updateRouteAverageMetrics(route) {
    try {
      const metrics = await SeoPerformanceMetric.aggregate([
        {
          $match: {
            route,
            timestamp: {
              $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        },
        {
          $group: {
            _id: null,
            avgTtfb: { $avg: '$metrics.ttfb' },
            avgFcp: { $avg: '$metrics.fcp' },
            avgLcp: { $avg: '$metrics.lcp' },
            avgFid: { $avg: '$metrics.fid' },
            avgCls: { $avg: '$metrics.cls' },
            avgTtl: { $avg: '$metrics.ttl' }
          }
        }
      ]);

      if (metrics.length > 0) {
        const averages = metrics[0];
        delete averages._id;

        await SeoSetting.updateOne(
          { route },
          {
            $set: {
              'performance.averages': averages,
              'performance.lastUpdated': new Date()
            }
          }
        );
      }
    } catch (error) {
      logger.error('Route average metrics update failed:', error);
    }
  }

  async #generateSitemapXml(routes) {
    const xml = [];
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    for (const route of routes) {
      xml.push('  <url>');
      xml.push(`    <loc>${process.env.SITE_URL}${route.route}</loc>`);
      xml.push(`    <lastmod>${route.lastmod.toISOString()}</lastmod>`);
      xml.push(`    <changefreq>${route.changefreq}</changefreq>`);
      xml.push(`    <priority>${route.priority}</priority>`);
      xml.push('  </url>');
    }

    xml.push('</urlset>');
    return xml.join('\n');
  }

  async #optimizeImageWithSharp(buffer, options) {
    // Sharp ile görsel optimizasyonu
    const optimizedBuffer = await sharp(buffer)
      .resize(options.width, options.height, {
        fit: options.fit || 'contain',
        background: options.background || { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .toFormat(options.format || 'webp', {
        quality: options.quality || 80,
        progressive: true,
        optimizeScans: true
      })
      .toBuffer();

    return optimizedBuffer;
  }

  #validateSeoSettings(settings) {
    // SEO ayarlarını doğrula
    const errors = [];

    if (!settings.title || settings.title.length > 60) {
      errors.push('Title must be between 1 and 60 characters');
    }
    if (!settings.description || settings.description.length > 160) {
      errors.push('Description must be between 1 and 160 characters');
    }
    if (settings.keywords && settings.keywords.length > 10) {
      errors.push('Maximum 10 keywords allowed');
    }

    return errors;
  }

  #validateCacheConfig(config) {
    // Cache ayarlarını doğrula
    const errors = [];

    if (config.maxAge < 0 || config.maxAge > 31536000) {
      errors.push('maxAge must be between 0 and 31536000 seconds');
    }
    if (config.staleWhileRevalidate < 0) {
      errors.push('staleWhileRevalidate must be greater than or equal to 0');
    }

    return errors;
  }
}

export default new SeoService();
