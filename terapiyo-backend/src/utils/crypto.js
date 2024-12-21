import crypto from 'crypto';
import logger from '../config/logger.js';

// Şifreleme için kullanılacak algoritma
const ALGORITHM = 'aes-256-gcm';

// Şifreleme için kullanılacak anahtar uzunluğu (byte)
const KEY_LENGTH = 32;

// IV uzunluğu (byte)
const IV_LENGTH = 16;

// Auth tag uzunluğu (byte)
const AUTH_TAG_LENGTH = 16;

/**
 * Veriyi şifrele
 */
export const encrypt = (data, key = process.env.ENCRYPTION_KEY) => {
  try {
    // Buffer'a çevir
    const dataBuffer = Buffer.from(JSON.stringify(data), 'utf8');
    
    // IV oluştur
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Cipher oluştur
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    
    // Veriyi şifrele
    const encrypted = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final()
    ]);
    
    // Auth tag al
    const authTag = cipher.getAuthTag();
    
    // Şifrelenmiş veriyi, IV ve auth tag ile birleştir
    return Buffer.concat([
      iv,
      authTag,
      encrypted
    ]).toString('base64');
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw error;
  }
};

/**
 * Şifrelenmiş veriyi çöz
 */
export const decrypt = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
  try {
    // Base64'ten buffer'a çevir
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // IV, auth tag ve şifrelenmiş veriyi ayır
    const iv = buffer.slice(0, IV_LENGTH);
    const authTag = buffer.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.slice(IV_LENGTH + AUTH_TAG_LENGTH);
    
    // Decipher oluştur
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    // Veriyi çöz
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    // JSON'a çevir
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    logger.error('Decryption failed:', error);
    throw error;
  }
};

/**
 * Hash oluştur
 */
export const hash = (data, algorithm = 'sha256') => {
  try {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  } catch (error) {
    logger.error('Hashing failed:', error);
    throw error;
  }
};

/**
 * HMAC oluştur
 */
export const hmac = (data, key = process.env.HMAC_KEY, algorithm = 'sha256') => {
  try {
    return crypto
      .createHmac(algorithm, key)
      .update(data)
      .digest('hex');
  } catch (error) {
    logger.error('HMAC generation failed:', error);
    throw error;
  }
};

/**
 * Rastgele anahtar oluştur
 */
export const generateKey = (length = KEY_LENGTH) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    logger.error('Key generation failed:', error);
    throw error;
  }
};

/**
 * Güvenli karşılaştırma
 */
export const secureCompare = (a, b) => {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  } catch (error) {
    logger.error('Secure comparison failed:', error);
    return false;
  }
};

/**
 * API anahtarı oluştur
 */
export const generateApiKey = () => {
  const prefix = 'tk';
  const key = generateKey(32);
  return `${prefix}_${key}`;
};

/**
 * API anahtarını hashle
 */
export const hashApiKey = (apiKey) => {
  return hash(apiKey);
};

export default {
  encrypt,
  decrypt,
  hash,
  hmac,
  generateKey,
  secureCompare,
  generateApiKey,
  hashApiKey
};
