import { ApiError } from '../utils/api-error.js';
import { securityConfig } from '../config/security.js';
import logger from '../config/logger.js';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// CORS ayarları
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 600 // 10 dakika
};

export const corsMiddleware = cors(corsOptions);

// Rate limiter ayarları
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // IP başına maksimum istek sayısı
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Güvenlik başlıkları middleware
 */
export const securityHeaders = (req, res, next) => {
  // Güvenlik başlıkları
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  next();
};

/**
 * API anahtarı doğrulama middleware
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== securityConfig.apiKey) {
    logger.warn('Geçersiz API anahtarı ile istek', { ip: req.ip });
    throw new ApiError(401, 'Geçersiz API anahtarı');
  }

  next();
};

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = (type = 'default') => {
  return (req, res, next) => {
    limiter(req, res, (err) => {
      if (err) {
        return next(new ApiError(429, 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'));
      }
      next();
    });
  };
};

/**
 * XSS koruma middleware
 */
export const xssProtection = (req, res, next) => {
  try {
    if (req.body) {
      const sanitize = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key]
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;')
              .replace(/\//g, '&#x2F;');
          } else if (typeof obj[key] === 'object') {
            sanitize(obj[key]);
          }
        }
      };

      sanitize(req.body);
    }

    next();
  } catch (error) {
    logger.error('XSS koruma hatası:', error);
    next(error);
  }
};

/**
 * SQL injection koruma middleware
 */
export const sqlInjectionProtection = (req, res, next) => {
  try {
    const checkForSqlInjection = (obj) => {
      const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b|\b(OR|AND)\b\s+\d+\s*[=<>]|\b(OR|AND)\b\s+\w+\s*[=<>]|'|--|#|\/\*|\*\/)/i;

      for (let key in obj) {
        if (typeof obj[key] === 'string' && sqlPattern.test(obj[key])) {
          throw new ApiError(400, 'Geçersiz karakter dizisi tespit edildi.');
        } else if (typeof obj[key] === 'object') {
          checkForSqlInjection(obj[key]);
        }
      }
    };

    if (req.body) checkForSqlInjection(req.body);
    if (req.query) checkForSqlInjection(req.query);
    if (req.params) checkForSqlInjection(req.params);

    next();
  } catch (error) {
    logger.error('SQL injection koruma hatası:', error);
    next(error);
  }
};

/**
 * Request boyutu kontrolü middleware
 */
export const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    const maxSize = parseInt(limit) * 1024 * 1024; // MB to bytes

    if (contentLength > maxSize) {
      throw new ApiError(413, 'İstek boyutu çok büyük.');
    }

    next();
  };
};

export { errorHandler } from './error.middleware.js';
