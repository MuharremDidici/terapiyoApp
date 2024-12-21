import { redis } from '../src/config/database.js';
import logger from '../src/config/logger.js';

async function resetRateLimits() {
  try {
    // Redis'e bağlan
    await redis.connect();
    logger.info('Redis\'e bağlandı');

    // Rate limit anahtarlarını bul
    const keys = await redis.keys('ratelimit:*');
    logger.info(`${keys.length} rate limit anahtarı bulundu`);

    // Anahtarları sil
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info('Rate limit anahtarları silindi');
    }

    logger.info('Rate limit sıfırlama tamamlandı');
    process.exit(0);
  } catch (error) {
    logger.error('Rate limit sıfırlama hatası:', error);
    process.exit(1);
  }
}

resetRateLimits();
