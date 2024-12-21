import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';
import logger from '../config/logger.js';

// Async versiyonları oluştur
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Şifreleme ayarları
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * Veri şifreleme sınıfı
 */
export class Encryption {
  constructor(options = {}) {
    this.options = {
      algorithm: options.algorithm || ALGORITHM,
      keyLength: options.keyLength || KEY_LENGTH,
      pbkdf2Iterations: options.pbkdf2Iterations || PBKDF2_ITERATIONS,
      compress: options.compress !== false
    };
  }

  /**
   * Veriyi şifrele
   */
  async encrypt(data, password = process.env.ENCRYPTION_KEY) {
    try {
      // Salt oluştur
      const salt = crypto.randomBytes(SALT_LENGTH);

      // Anahtar türet
      const key = await this.#deriveKey(password, salt);

      // IV oluştur
      const iv = crypto.randomBytes(IV_LENGTH);

      // Cipher oluştur
      const cipher = crypto.createCipheriv(this.options.algorithm, key, iv);

      // Veriyi JSON'a çevir ve sıkıştır
      let dataBuffer = Buffer.from(JSON.stringify(data), 'utf8');
      if (this.options.compress) {
        dataBuffer = await gzip(dataBuffer);
      }

      // Veriyi şifrele
      const encrypted = Buffer.concat([
        cipher.update(dataBuffer),
        cipher.final()
      ]);

      // Auth tag al
      const tag = cipher.getAuthTag();

      // Tüm bileşenleri birleştir
      const result = Buffer.concat([
        salt,
        iv,
        tag,
        encrypted
      ]);

      return result.toString('base64');
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw error;
    }
  }

  /**
   * Şifrelenmiş veriyi çöz
   */
  async decrypt(encryptedData, password = process.env.ENCRYPTION_KEY) {
    try {
      // Base64'ten buffer'a çevir
      const buffer = Buffer.from(encryptedData, 'base64');

      // Bileşenleri ayır
      const salt = buffer.slice(0, SALT_LENGTH);
      const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
      const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
      const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

      // Anahtar türet
      const key = await this.#deriveKey(password, salt);

      // Decipher oluştur
      const decipher = crypto.createDecipheriv(this.options.algorithm, key, iv);
      decipher.setAuthTag(tag);

      // Veriyi çöz
      let decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      // Sıkıştırılmış veriyi aç
      if (this.options.compress) {
        decrypted = await gunzip(decrypted);
      }

      // JSON'dan parse et
      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Anahtar türet
   */
  async #deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.options.pbkdf2Iterations,
        this.options.keyLength,
        'sha512',
        (err, key) => {
          if (err) reject(err);
          else resolve(key);
        }
      );
    });
  }
}

/**
 * Encryption örneği oluştur
 */
export const encryption = new Encryption();

export const createEncryptionClient = (options) => {
  return new Encryption(options);
};

export const encrypt = (data, password) => {
  return encryption.encrypt(data, password);
};

export const decrypt = (data, password) => {
  return encryption.decrypt(data, password);
};

export default encryption;
