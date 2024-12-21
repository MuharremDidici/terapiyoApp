import zlib from 'zlib';
import { promisify } from 'util';
import logger from '../config/logger.js';

// Async versiyonları oluştur
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

/**
 * Sıkıştırma yardımcısı
 */
export class Compression {
  constructor(options = {}) {
    this.options = {
      algorithm: options.algorithm || 'gzip',
      level: options.level || zlib.constants.Z_BEST_COMPRESSION,
      memLevel: options.memLevel || 8,
      strategy: options.strategy || zlib.constants.Z_DEFAULT_STRATEGY
    };
  }

  /**
   * Veriyi sıkıştır
   */
  async compress(data, options = {}) {
    try {
      const algorithm = options.algorithm || this.options.algorithm;
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

      switch (algorithm.toLowerCase()) {
        case 'gzip':
          return await gzip(buffer, {
            level: options.level || this.options.level,
            memLevel: options.memLevel || this.options.memLevel,
            strategy: options.strategy || this.options.strategy
          });

        case 'brotli':
          return await brotliCompress(buffer, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: options.quality || 11,
              [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buffer.length
            }
          });

        case 'deflate':
          return await deflate(buffer, {
            level: options.level || this.options.level,
            memLevel: options.memLevel || this.options.memLevel,
            strategy: options.strategy || this.options.strategy
          });

        default:
          throw new Error(`Unsupported compression algorithm: ${algorithm}`);
      }
    } catch (error) {
      logger.error('Compression failed:', error);
      throw error;
    }
  }

  /**
   * Sıkıştırılmış veriyi aç
   */
  async decompress(data, options = {}) {
    try {
      const algorithm = options.algorithm || this.options.algorithm;
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

      switch (algorithm.toLowerCase()) {
        case 'gzip':
          return await gunzip(buffer);

        case 'brotli':
          return await brotliDecompress(buffer);

        case 'deflate':
          return await inflate(buffer);

        default:
          throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
      }
    } catch (error) {
      logger.error('Decompression failed:', error);
      throw error;
    }
  }

  /**
   * Sıkıştırma oranını hesapla
   */
  calculateCompressionRatio(original, compressed) {
    const originalSize = Buffer.byteLength(original);
    const compressedSize = Buffer.byteLength(compressed);
    return 1 - (compressedSize / originalSize);
  }

  /**
   * En iyi sıkıştırma algoritmasını bul
   */
  async findBestCompression(data) {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const originalSize = buffer.byteLength;
      const results = [];

      // Farklı algoritmaları dene
      const algorithms = ['gzip', 'brotli', 'deflate'];
      for (const algorithm of algorithms) {
        const compressed = await this.compress(buffer, { algorithm });
        const compressedSize = compressed.byteLength;
        const ratio = this.calculateCompressionRatio(buffer, compressed);

        results.push({
          algorithm,
          originalSize,
          compressedSize,
          ratio,
          savings: originalSize - compressedSize
        });
      }

      // En iyi sonucu bul
      results.sort((a, b) => b.ratio - a.ratio);
      return results[0];
    } catch (error) {
      logger.error('Best compression search failed:', error);
      throw error;
    }
  }

  /**
   * Sıkıştırma seviyesini optimize et
   */
  async optimizeCompressionLevel(data, algorithm = 'gzip') {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const results = [];

      // Farklı seviyeleri dene
      for (let level = 1; level <= 9; level++) {
        const start = Date.now();
        const compressed = await this.compress(buffer, { algorithm, level });
        const duration = Date.now() - start;

        results.push({
          level,
          ratio: this.calculateCompressionRatio(buffer, compressed),
          duration,
          size: compressed.byteLength
        });
      }

      // En iyi seviyeyi bul (oran ve hız dengesi)
      results.sort((a, b) => (b.ratio / b.duration) - (a.ratio / a.duration));
      return results[0].level;
    } catch (error) {
      logger.error('Compression level optimization failed:', error);
      throw error;
    }
  }
}

/**
 * Sıkıştırma yardımcısı örneği oluştur
 */
export const compression = new Compression();

export const createCompressionClient = (options) => {
  return new Compression(options);
};

export const compress = (data, options) => {
  return compression.compress(data, options);
};

export const decompress = (data, options) => {
  return compression.decompress(data, options);
};

export const findBestCompression = (data) => {
  return compression.findBestCompression(data);
};

export const optimizeCompressionLevel = (data, algorithm) => {
  return compression.optimizeCompressionLevel(data, algorithm);
};

export default compression;
