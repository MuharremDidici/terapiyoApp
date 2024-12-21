import { ApiError } from '../utils/api-error.js';
import Integration from '../models/integration.model.js';
import { hashApiKey } from '../utils/crypto.js';
import logger from '../config/logger.js';

/**
 * API anahtarı doğrulama
 */
export const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      throw new ApiError(401, 'API anahtarı gerekli');
    }

    // API anahtarını hashle
    const hashedKey = hashApiKey(apiKey);

    // Entegrasyonu bul
    const integration = await Integration.findOne({ apiKey: hashedKey });
    if (!integration) {
      throw new ApiError(401, 'Geçersiz API anahtarı');
    }

    // Entegrasyon aktif mi kontrol et
    if (!integration.isActive) {
      throw new ApiError(403, 'Bu API anahtarı devre dışı');
    }

    // İsteğe entegrasyon bilgilerini ekle
    req.integration = integration;

    next();
  } catch (error) {
    logger.error('API key validation failed:', error);
    next(error);
  }
};

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Geçersiz API anahtarı'
    });
  }
  
  next();
};

export default apiKeyMiddleware;
