import { Transform, Readable, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip, createGunzip } from 'zlib';
import { encryption } from './encryption.js';
import { compression } from './compression.js';
import logger from '../config/logger.js';

/**
 * Yedekleme akışı
 */
export class BackupStream {
  constructor(options = {}) {
    this.options = {
      compress: options.compress !== false,
      encrypt: options.encrypt !== false,
      chunkSize: options.chunkSize || 64 * 1024, // 64KB
      concurrency: options.concurrency || 4
    };
  }

  /**
   * Yedekleme akışı oluştur
   */
  async createBackupStream(source, destination, options = {}) {
    try {
      const sourceStream = this.#createSourceStream(source);
      const destinationStream = this.#createDestinationStream(destination);

      // Dönüştürücü akışları oluştur
      const transforms = [];

      // Sıkıştırma ekle
      if (this.options.compress) {
        transforms.push(createGzip());
      }

      // Şifreleme ekle
      if (this.options.encrypt) {
        transforms.push(this.#createEncryptionTransform());
      }

      // İlerleme takibi ekle
      const progressTransform = this.#createProgressTransform();
      transforms.push(progressTransform);

      // Akışları birleştir
      await pipeline(
        sourceStream,
        ...transforms,
        destinationStream
      );

      return progressTransform.getStats();
    } catch (error) {
      logger.error('Backup stream failed:', error);
      throw error;
    }
  }

  /**
   * Yedekleme akışından geri yükle
   */
  async restoreFromBackup(source, destination, options = {}) {
    try {
      const sourceStream = this.#createSourceStream(source);
      const destinationStream = this.#createDestinationStream(destination);

      // Dönüştürücü akışları oluştur
      const transforms = [];

      // Şifre çözme ekle
      if (this.options.encrypt) {
        transforms.push(this.#createDecryptionTransform());
      }

      // Sıkıştırma açma ekle
      if (this.options.compress) {
        transforms.push(createGunzip());
      }

      // İlerleme takibi ekle
      const progressTransform = this.#createProgressTransform();
      transforms.push(progressTransform);

      // Akışları birleştir
      await pipeline(
        sourceStream,
        ...transforms,
        destinationStream
      );

      return progressTransform.getStats();
    } catch (error) {
      logger.error('Restore stream failed:', error);
      throw error;
    }
  }

  /**
   * Kaynak akışı oluştur
   */
  #createSourceStream(source) {
    if (source instanceof Readable) {
      return source;
    }
    if (typeof source === 'string') {
      return createReadStream(source, {
        highWaterMark: this.options.chunkSize
      });
    }
    throw new Error('Invalid source');
  }

  /**
   * Hedef akışı oluştur
   */
  #createDestinationStream(destination) {
    if (destination instanceof Writable) {
      return destination;
    }
    if (typeof destination === 'string') {
      return createWriteStream(destination, {
        highWaterMark: this.options.chunkSize
      });
    }
    throw new Error('Invalid destination');
  }

  /**
   * Şifreleme dönüştürücüsü oluştur
   */
  #createEncryptionTransform() {
    return new Transform({
      transform: async (chunk, encoding, callback) => {
        try {
          const encrypted = await encryption.encrypt(chunk);
          callback(null, encrypted);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  /**
   * Şifre çözme dönüştürücüsü oluştur
   */
  #createDecryptionTransform() {
    return new Transform({
      transform: async (chunk, encoding, callback) => {
        try {
          const decrypted = await encryption.decrypt(chunk);
          callback(null, decrypted);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  /**
   * İlerleme takibi dönüştürücüsü oluştur
   */
  #createProgressTransform() {
    const stats = {
      bytesProcessed: 0,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      speed: 0
    };

    const transform = new Transform({
      transform(chunk, encoding, callback) {
        stats.bytesProcessed += chunk.length;
        stats.endTime = Date.now();
        stats.duration = stats.endTime - stats.startTime;
        stats.speed = stats.bytesProcessed / (stats.duration / 1000); // bytes/second

        this.emit('progress', {
          bytesProcessed: stats.bytesProcessed,
          duration: stats.duration,
          speed: stats.speed
        });

        callback(null, chunk);
      }
    });

    transform.getStats = () => ({ ...stats });
    return transform;
  }
}

/**
 * Yedekleme akışı örneği oluştur
 */
export const backupStream = new BackupStream();

export const createBackupStream = (source, destination, options) => {
  return backupStream.createBackupStream(source, destination, options);
};

export const createRestoreStream = (source, destination, options) => {
  return backupStream.restoreFromBackup(source, destination, options);
};

export default backupStream;
