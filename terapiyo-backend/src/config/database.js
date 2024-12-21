import mongoose from 'mongoose';
import Redis from 'ioredis';
import logger from './logger.js';

// MongoDB connection
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Redis connection
const redisConfig = {
  host: '89.213.56.250',
  port: 6379,
  username: 'default',
  password: 'SifreBurayaGelsin',  // Şifreyi doğrudan belirtelim
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: true,
  showFriendlyErrorStack: true,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
};

logger.info('Redis configuration:', { host: redisConfig.host, port: redisConfig.port });

export const redis = new Redis(redisConfig);

// Redis bağlantısını test et
redis.on('connect', () => {
  logger.info('Redis connected successfully');
  // Bağlantıyı test et
  redis.ping().then(() => {
    logger.info('Redis connection test successful');
  }).catch((error) => {
    logger.error('Redis connection test failed:', error);
  });
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

export default { connectMongoDB, redis };
