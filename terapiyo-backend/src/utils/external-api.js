import axios from 'axios';
import logger from '../config/logger.js';

/**
 * Harici API ile sertifika doğrulama
 */
export const verifyWithExternalApi = async (certificate, apiConfig) => {
  try {
    const { baseUrl, endpoints, headers } = apiConfig;
    
    // API endpoint'ini oluştur
    const verificationUrl = `${baseUrl}${endpoints.verify}`;
    
    // Doğrulama isteği gönder
    const response = await axios.post(verificationUrl, {
      certificateId: certificate.serialNumber,
      issuer: certificate.issuer,
      issuedAt: certificate.issuedAt
    }, {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
    
    // API yanıtını kontrol et
    if (response.status === 200 && response.data.verified) {
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('External API verification error:', error);
    return false;
  }
};

/**
 * Harici API ile sertifika bilgilerini al
 */
export const getCertificateDetails = async (certificateId, apiConfig) => {
  try {
    const { baseUrl, endpoints, headers } = apiConfig;
    
    // API endpoint'ini oluştur
    const detailsUrl = `${baseUrl}${endpoints.details}/${certificateId}`;
    
    // Bilgi alma isteği gönder
    const response = await axios.get(detailsUrl, {
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    });
    
    // API yanıtını kontrol et
    if (response.status === 200) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    logger.error('External API details fetch error:', error);
    return null;
  }
};
