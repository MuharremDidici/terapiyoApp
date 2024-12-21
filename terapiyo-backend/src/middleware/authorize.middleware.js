import { ApiError } from '../utils/api-error.js';
import User from '../models/user.model.js';
import logger from '../config/logger.js';

/**
 * Rol bazlı yetkilendirme middleware
 */
export const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Yetkilendirme başarısız.');
      }

      // Rol kontrolü
      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Bu işlem için yetkiniz yok.');
      }

      // Hesap durumu kontrolü
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        throw new ApiError(403, 'Hesabınız aktif değil.');
      }

      // Terapist özel kontroller
      if (user.role === 'therapist') {
        if (!user.isVerified) {
          throw new ApiError(403, 'Hesabınız henüz onaylanmamış.');
        }

        if (user.suspendedUntil && user.suspendedUntil > new Date()) {
          throw new ApiError(403, 'Hesabınız geçici olarak askıya alınmış.');
        }
      }

      next();
    } catch (error) {
      logger.error('Yetkilendirme hatası:', error);
      next(error);
    }
  };
};
