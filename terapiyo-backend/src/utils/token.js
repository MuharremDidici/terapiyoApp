import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { redis } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * JWT token oluştur
 */
export const generateJWT = (payload, expiresIn = '1d') => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  } catch (error) {
    logger.error('JWT generation failed:', error);
    throw error;
  }
};

/**
 * JWT token doğrula
 */
export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
};

/**
 * Rastgele token oluştur
 */
export const generateToken = (length = 32) => {
  return nanoid(length);
};

/**
 * Token'ı blacklist'e ekle
 */
export const blacklistToken = async (token, expiresIn = 86400) => {
  try {
    await redis.setex(`blacklist:${token}`, expiresIn, 'true');
    return true;
  } catch (error) {
    logger.error('Token blacklisting failed:', error);
    return false;
  }
};

/**
 * Token'ın blacklist'te olup olmadığını kontrol et
 */
export const isTokenBlacklisted = async (token) => {
  try {
    const result = await redis.get(`blacklist:${token}`);
    return result === 'true';
  } catch (error) {
    logger.error('Token blacklist check failed:', error);
    return true; // Güvenlik için hata durumunda token'ı geçersiz say
  }
};

/**
 * Refresh token oluştur
 */
export const generateRefreshToken = async (userId) => {
  try {
    const refreshToken = generateToken(64);
    
    // Redis'e kaydet
    await redis.setex(
      `refresh_token:${refreshToken}`,
      30 * 24 * 60 * 60, // 30 gün
      userId
    );

    return refreshToken;
  } catch (error) {
    logger.error('Refresh token generation failed:', error);
    throw error;
  }
};

/**
 * Refresh token doğrula
 */
export const verifyRefreshToken = async (refreshToken) => {
  try {
    const userId = await redis.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      return null;
    }
    return userId;
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    return null;
  }
};

/**
 * Refresh token'ı sil
 */
export const deleteRefreshToken = async (refreshToken) => {
  try {
    await redis.del(`refresh_token:${refreshToken}`);
    return true;
  } catch (error) {
    logger.error('Refresh token deletion failed:', error);
    return false;
  }
};
