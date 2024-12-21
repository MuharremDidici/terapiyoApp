import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/api-error.js';
import User from '../models/user.model.js';
import logger from '../config/logger.js';

/**
 * JWT token doğrulama
 */
export const protect = async (req, res, next) => {
  try {
    logger.info('Auth Middleware - Headers:', req.headers);
    
    // Token kontrolü
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Yetkilendirme başlığı geçersiz');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Token bulunamadı');
    }

    // Token çözümleme
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    logger.info('Auth Middleware - Decoded Token:', decoded);
    
    if (!decoded) {
      throw new ApiError(401, 'Token geçersiz');
    }

    // Kullanıcı kontrolü
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(404, 'Kullanıcı bulunamadı');
    }

    logger.info('Auth Middleware - User:', { userId: user._id, email: user.email });

    // İsteğe kullanıcı bilgilerini ekle
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth Middleware - Error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Token süresi doldu'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Token geçersiz'));
    } else {
      next(error);
    }
  }
};

/**
 * Rol bazlı yetkilendirme
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Bu işlem için yetkiniz yok');
    }
    next();
  };
};

/**
 * Kimlik doğrulama
 */
export const authenticate = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      throw new ApiError(400, 'Email ve şifre gereklidir');
    }

    // Kullanıcı kontrolü
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Email veya şifre hatalı');
    }

    // Şifre kontrolü
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Email veya şifre hatalı');
    }

    // İsteğe kullanıcı bilgilerini ekle
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
