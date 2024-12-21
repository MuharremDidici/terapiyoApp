import sharp from 'sharp';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import logger from '../../config/logger.js';

const UPLOAD_DIR = 'uploads/optimized';

/**
 * Optimize image with various configurations
 */
export async function optimizeImage(imageUrl, options = {}) {
  try {
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    const buffer = Buffer.from(response.data);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Create optimized versions
    const versions = await Promise.all([
      createWebpVersion(buffer, metadata, options),
      createAvifVersion(buffer, metadata, options),
      createJpegVersion(buffer, metadata, options),
      createPngVersion(buffer, metadata, options)
    ]);

    return versions.filter(Boolean);
  } catch (error) {
    logger.error('Image optimization failed:', error);
    throw error;
  }
}

/**
 * Create WebP version of the image
 */
async function createWebpVersion(buffer, metadata, options) {
  try {
    const sizes = options.sizes || [
      { width: 320, height: null },
      { width: 640, height: null },
      { width: 1280, height: null }
    ];

    const versions = await Promise.all(
      sizes.map(async (size) => {
        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const image = sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({
            quality: options.quality || 80,
            effort: 4
          });

        await image.toFile(filepath);

        const optimizedMetadata = await image.metadata();

        return {
          width: optimizedMetadata.width,
          height: optimizedMetadata.height,
          format: 'webp',
          quality: options.quality || 80,
          url: `/static/optimized/${filename}`,
          size: (await fs.stat(filepath)).size
        };
      })
    );

    return versions;
  } catch (error) {
    logger.error('WebP version creation failed:', error);
    return null;
  }
}

/**
 * Create AVIF version of the image
 */
async function createAvifVersion(buffer, metadata, options) {
  try {
    const sizes = options.sizes || [
      { width: 320, height: null },
      { width: 640, height: null },
      { width: 1280, height: null }
    ];

    const versions = await Promise.all(
      sizes.map(async (size) => {
        const filename = `${uuidv4()}.avif`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const image = sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .avif({
            quality: options.quality || 80,
            effort: 4
          });

        await image.toFile(filepath);

        const optimizedMetadata = await image.metadata();

        return {
          width: optimizedMetadata.width,
          height: optimizedMetadata.height,
          format: 'avif',
          quality: options.quality || 80,
          url: `/static/optimized/${filename}`,
          size: (await fs.stat(filepath)).size
        };
      })
    );

    return versions;
  } catch (error) {
    logger.error('AVIF version creation failed:', error);
    return null;
  }
}

/**
 * Create JPEG version of the image
 */
async function createJpegVersion(buffer, metadata, options) {
  try {
    const sizes = options.sizes || [
      { width: 320, height: null },
      { width: 640, height: null },
      { width: 1280, height: null }
    ];

    const versions = await Promise.all(
      sizes.map(async (size) => {
        const filename = `${uuidv4()}.jpg`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const image = sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({
            quality: options.quality || 80,
            progressive: true,
            optimizeScans: true
          });

        await image.toFile(filepath);

        const optimizedMetadata = await image.metadata();

        return {
          width: optimizedMetadata.width,
          height: optimizedMetadata.height,
          format: 'jpeg',
          quality: options.quality || 80,
          url: `/static/optimized/${filename}`,
          size: (await fs.stat(filepath)).size
        };
      })
    );

    return versions;
  } catch (error) {
    logger.error('JPEG version creation failed:', error);
    return null;
  }
}

/**
 * Create PNG version of the image
 */
async function createPngVersion(buffer, metadata, options) {
  try {
    // Only create PNG version if original has alpha channel
    if (!metadata.hasAlpha) {
      return null;
    }

    const sizes = options.sizes || [
      { width: 320, height: null },
      { width: 640, height: null },
      { width: 1280, height: null }
    ];

    const versions = await Promise.all(
      sizes.map(async (size) => {
        const filename = `${uuidv4()}.png`;
        const filepath = path.join(UPLOAD_DIR, filename);

        const image = sharp(buffer)
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({
            compressionLevel: 9,
            palette: true
          });

        await image.toFile(filepath);

        const optimizedMetadata = await image.metadata();

        return {
          width: optimizedMetadata.width,
          height: optimizedMetadata.height,
          format: 'png',
          quality: 100,
          url: `/static/optimized/${filename}`,
          size: (await fs.stat(filepath)).size
        };
      })
    );

    return versions;
  } catch (error) {
    logger.error('PNG version creation failed:', error);
    return null;
  }
}

/**
 * Clean up old optimized images
 */
export async function cleanupOptimizedImages(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
  try {
    const files = await fs.readdir(UPLOAD_DIR);

    await Promise.all(
      files.map(async (file) => {
        const filepath = path.join(UPLOAD_DIR, file);
        const stats = await fs.stat(filepath);

        if (Date.now() - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filepath);
        }
      })
    );
  } catch (error) {
    logger.error('Image cleanup failed:', error);
  }
}
