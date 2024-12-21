import crypto from 'crypto';
import config from './config.js';
import { redis } from './database.js';
import logger from './logger.js';

// Güvenlik ayarları
const securityConfig = {
  // Şifreleme ayarları
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 64,
    iterations: 100000,
    digest: 'sha512'
  },

  // JWT ayarları
  jwt: {
    accessToken: {
      secret: config.jwt.accessTokenSecret,
      expiresIn: '15m'
    },
    refreshToken: {
      secret: config.jwt.refreshTokenSecret,
      expiresIn: '7d'
    }
  },

  // Oturum ayarları
  session: {
    maxActiveSessions: 5,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60, // 15 dakika
    rememberMeDuration: 30 * 24 * 60 * 60 // 30 gün
  },

  // Rate limiting ayarları
  rateLimit: {
    window: 60 * 60 * 1000, // 1 saat
    maxRequests: {
      default: 1000,
      auth: 500, // Auth istekleri için limit arttırıldı
      api: 1000  // API istekleri için limit arttırıldı
    }
  },

  // İstemci güvenliği
  client: {
    allowedOrigins: config.cors.allowedOrigins,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 24 * 60 * 60 // 24 saat
  },

  // Güvenlik başlıkları
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 yıl
      includeSubDomains: true,
      preload: true
    }
  }
};

// Şifreleme yardımcıları
const encryptionHelpers = {
  /**
   * Veri şifreleme
   */
  encrypt: (text, key = config.encryption.key) => {
    try {
      const iv = crypto.randomBytes(securityConfig.encryption.ivLength);
      const cipher = crypto.createCipheriv(
        securityConfig.encryption.algorithm,
        Buffer.from(key, 'hex'),
        iv
      );

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const tag = cipher.getAuthTag();

      return {
        iv: iv.toString('hex'),
        content: encrypted,
        tag: tag.toString('hex')
      };
    } catch (error) {
      logger.error('Şifreleme hatası:', error);
      throw error;
    }
  },

  /**
   * Veri şifre çözme
   */
  decrypt: (encrypted, key = config.encryption.key) => {
    try {
      const decipher = crypto.createDecipheriv(
        securityConfig.encryption.algorithm,
        Buffer.from(key, 'hex'),
        Buffer.from(encrypted.iv, 'hex')
      );

      decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));

      let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Şifre çözme hatası:', error);
      throw error;
    }
  },

  /**
   * Şifre hashleme
   */
  hashPassword: async (password) => {
    try {
      const salt = crypto.randomBytes(securityConfig.encryption.saltLength);
      
      const hash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(
          password,
          salt,
          securityConfig.encryption.iterations,
          securityConfig.encryption.keyLength,
          securityConfig.encryption.digest,
          (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey);
          }
        );
      });

      return {
        hash: hash.toString('hex'),
        salt: salt.toString('hex')
      };
    } catch (error) {
      logger.error('Şifre hashleme hatası:', error);
      throw error;
    }
  },

  /**
   * Şifre doğrulama
   */
  verifyPassword: async (password, hash, salt) => {
    try {
      const verifyHash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(
          password,
          Buffer.from(salt, 'hex'),
          securityConfig.encryption.iterations,
          securityConfig.encryption.keyLength,
          securityConfig.encryption.digest,
          (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey);
          }
        );
      });

      return verifyHash.toString('hex') === hash;
    } catch (error) {
      logger.error('Şifre doğrulama hatası:', error);
      throw error;
    }
  }
};

// Oturum yönetimi
const sessionManager = {
  /**
   * Aktif oturum kontrolü
   */
  checkActiveSessions: async (userId) => {
    try {
      const sessions = await redis.scard(`user:${userId}:sessions`);
      return sessions < securityConfig.session.maxActiveSessions;
    } catch (error) {
      logger.error('Oturum kontrolü hatası:', error);
      throw error;
    }
  },

  /**
   * Oturum ekleme
   */
  addSession: async (userId, sessionId, deviceInfo) => {
    try {
      const multi = redis.multi();

      // Oturum bilgilerini kaydet
      multi.sadd(`user:${userId}:sessions`, sessionId);
      multi.hmset(`session:${sessionId}`, {
        userId,
        deviceInfo: JSON.stringify(deviceInfo),
        createdAt: Date.now()
      });

      // Remember me varsa süreyi uzat
      if (deviceInfo.rememberMe) {
        multi.expire(
          `session:${sessionId}`,
          securityConfig.session.rememberMeDuration
        );
      }

      await multi.exec();
    } catch (error) {
      logger.error('Oturum ekleme hatası:', error);
      throw error;
    }
  },

  /**
   * Oturum silme
   */
  removeSession: async (userId, sessionId) => {
    try {
      const multi = redis.multi();
      multi.srem(`user:${userId}:sessions`, sessionId);
      multi.del(`session:${sessionId}`);
      await multi.exec();
    } catch (error) {
      logger.error('Oturum silme hatası:', error);
      throw error;
    }
  },

  /**
   * Tüm oturumları silme
   */
  removeAllSessions: async (userId) => {
    try {
      const sessions = await redis.smembers(`user:${userId}:sessions`);
      const multi = redis.multi();

      for (const sessionId of sessions) {
        multi.del(`session:${sessionId}`);
      }

      multi.del(`user:${userId}:sessions`);
      await multi.exec();
    } catch (error) {
      logger.error('Tüm oturumları silme hatası:', error);
      throw error;
    }
  }
};

// Rate limiting yönetimi
const rateLimiter = {
  /**
   * İstek sayısı kontrolü
   */
  checkRateLimit: async (key, type = 'default') => {
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.pexpire(key, securityConfig.rateLimit.window);
      }

      return current <= securityConfig.rateLimit.maxRequests[type];
    } catch (error) {
      logger.error('Rate limit kontrolü hatası:', error);
      throw error;
    }
  },

  /**
   * Rate limit sıfırlama
   */
  resetRateLimit: async (key) => {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Rate limit sıfırlama hatası:', error);
      throw error;
    }
  }
};

export {
  securityConfig,
  encryptionHelpers,
  sessionManager,
  rateLimiter
};
