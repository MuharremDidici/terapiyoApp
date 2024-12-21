import { create } from 'xmlbuilder2';
import logger from '../../config/logger.js';

const BASE_URL = process.env.BASE_URL || 'https://terapiyo.com';

/**
 * Generate XML sitemap from routes
 */
export function generateSitemap(routes) {
  try {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      });

    routes.forEach(route => {
      const url = doc.ele('url');
      url.ele('loc').txt(`${BASE_URL}${route.route}`);
      
      if (route.lastmod) {
        url.ele('lastmod').txt(route.lastmod.toISOString());
      }
      
      if (route.changefreq) {
        url.ele('changefreq').txt(route.changefreq);
      }
      
      if (route.priority !== undefined) {
        url.ele('priority').txt(route.priority.toString());
      }
    });

    return doc.end({ prettyPrint: true });
  } catch (error) {
    logger.error('Sitemap generation failed:', error);
    throw error;
  }
}

/**
 * Generate dynamic sitemap index
 */
export function generateSitemapIndex(sitemaps) {
  try {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('sitemapindex', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      });

    sitemaps.forEach(sitemap => {
      const sitemapEle = doc.ele('sitemap');
      sitemapEle.ele('loc').txt(`${BASE_URL}${sitemap.location}`);
      
      if (sitemap.lastmod) {
        sitemapEle.ele('lastmod').txt(sitemap.lastmod.toISOString());
      }
    });

    return doc.end({ prettyPrint: true });
  } catch (error) {
    logger.error('Sitemap index generation failed:', error);
    throw error;
  }
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(sitemaps) {
  try {
    let content = '';

    // Add User-agent rules
    content += 'User-agent: *\n';
    content += 'Allow: /\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /api/\n';
    content += 'Disallow: /auth/\n\n';

    // Add Crawl-delay
    content += 'Crawl-delay: 10\n\n';

    // Add Sitemaps
    sitemaps.forEach(sitemap => {
      content += `Sitemap: ${BASE_URL}${sitemap.location}\n`;
    });

    return content;
  } catch (error) {
    logger.error('Robots.txt generation failed:', error);
    throw error;
  }
}

/**
 * Generate structured data for routes
 */
export function generateStructuredData(route, data) {
  try {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': data.type
    };

    switch (data.type) {
      case 'Organization':
        return {
          ...baseStructure,
          name: 'Terapiyo',
          url: BASE_URL,
          logo: `${BASE_URL}/static/images/logo.png`,
          sameAs: [
            'https://facebook.com/terapiyo',
            'https://twitter.com/terapiyo',
            'https://instagram.com/terapiyo'
          ]
        };

      case 'Person':
        return {
          ...baseStructure,
          name: data.name,
          jobTitle: 'Therapist',
          description: data.description,
          image: data.image,
          url: `${BASE_URL}${route}`
        };

      case 'Service':
        return {
          ...baseStructure,
          name: data.name,
          provider: {
            '@type': 'Organization',
            name: 'Terapiyo'
          },
          description: data.description,
          url: `${BASE_URL}${route}`
        };

      default:
        return baseStructure;
    }
  } catch (error) {
    logger.error('Structured data generation failed:', error);
    throw error;
  }
}
