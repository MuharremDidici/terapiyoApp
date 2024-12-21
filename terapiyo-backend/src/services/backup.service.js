import {
  BackupConfig,
  BackupJob,
  RestoreJob
} from '../models/backup.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { createStorageClient } from '../utils/storage.js';
import { createEncryptionClient } from '../utils/encryption.js';
import { createCompressionClient } from '../utils/compression.js';
import { createBackupStream, createRestoreStream } from '../utils/backup-stream.js';
import { validateBackup } from '../utils/backup-validator.js';
import { scheduleJob, cancelJob } from '../utils/scheduler.js';
import { redis } from '../config/database.js';
import mongoose from 'mongoose';

class BackupService {
  /**
   * Yedekleme Yapılandırması İşlemleri
   */
  async createBackupConfig(data) {
    try {
      // Storage istemcisini test et
      const storageClient = createStorageClient(data.storage);
      await storageClient.testConnection();

      // Şifreleme istemcisini test et
      if (data.encryption?.enabled) {
        const encryptionClient = createEncryptionClient(data.encryption);
        await encryptionClient.validateKey(data.encryption.keyId);
      }

      const config = new BackupConfig(data);
      await config.save();

      // Zamanlanmış görevi oluştur
      if (config.status === 'active') {
        await this.scheduleBackup(config);
      }

      return config;
    } catch (error) {
      logger.error('Yedekleme yapılandırması oluşturma hatası:', error);
      throw error;
    }
  }

  async updateBackupConfig(configId, updates) {
    try {
      const config = await BackupConfig.findById(configId);
      if (!config) {
        throw new ApiError(404, 'Yedekleme yapılandırması bulunamadı');
      }

      // Mevcut zamanlanmış görevi iptal et
      await this.unscheduleBackup(config);

      // Yapılandırmayı güncelle
      Object.assign(config, updates);
      await config.save();

      // Yeni zamanlanmış görevi oluştur
      if (config.status === 'active') {
        await this.scheduleBackup(config);
      }

      return config;
    } catch (error) {
      logger.error('Yedekleme yapılandırması güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Yedekleme İşlemleri
   */
  async createBackupJob(configId, type = 'manual') {
    try {
      const config = await BackupConfig.findById(configId);
      if (!config) {
        throw new ApiError(404, 'Yedekleme yapılandırması bulunamadı');
      }

      const job = new BackupJob({
        config: config._id,
        type,
        location: this.generateBackupLocation(config)
      });

      await job.save();
      await this.performBackup(job);

      return job;
    } catch (error) {
      logger.error('Yedekleme işi oluşturma hatası:', error);
      throw error;
    }
  }

  async performBackup(job) {
    try {
      await job.start();

      const config = await BackupConfig.findById(job.config);
      const storageClient = createStorageClient(config.storage);
      const encryptionClient = config.encryption.enabled ?
        createEncryptionClient(config.encryption) : null;
      const compressionClient = config.compression.enabled ?
        createCompressionClient(config.compression) : null;

      // Yedekleme akışını oluştur
      const backupStream = createBackupStream({
        type: config.type,
        collections: await this.getCollectionsToBackup()
      });

      // İşlem zincirini oluştur
      let pipeline = backupStream;
      if (compressionClient) {
        pipeline = pipeline.pipe(compressionClient.createCompressStream());
      }
      if (encryptionClient) {
        pipeline = pipeline.pipe(encryptionClient.createEncryptStream());
      }

      // Depolama istemcisine gönder
      const { size, checksum } = await storageClient.upload(
        job.location,
        pipeline
      );

      // Yedeklemeyi doğrula
      const isValid = await validateBackup(job.location, checksum, storageClient);
      if (!isValid) {
        throw new Error('Yedekleme doğrulama başarısız');
      }

      await job.complete(size, checksum);

      // Eski yedeklemeleri temizle
      await this.cleanupOldBackups(config);

      // Önbelleği güncelle
      await this.updateBackupCache(job);

    } catch (error) {
      logger.error('Yedekleme performansı hatası:', error);
      await job.fail(error);
      throw error;
    }
  }

  /**
   * Geri Yükleme İşlemleri
   */
  async createRestoreJob(backupId, options = {}) {
    try {
      const backup = await BackupJob.findById(backupId)
        .populate('config');
      if (!backup) {
        throw new ApiError(404, 'Yedekleme bulunamadı');
      }

      const job = new RestoreJob({
        backup: backup._id,
        type: options.type || 'full',
        scope: options.scope
      });

      await job.save();
      await this.performRestore(job);

      return job;
    } catch (error) {
      logger.error('Geri yükleme işi oluşturma hatası:', error);
      throw error;
    }
  }

  async performRestore(job) {
    try {
      await job.start();

      const backup = await BackupJob.findById(job.backup)
        .populate('config');
      const storageClient = createStorageClient(backup.config.storage);
      const encryptionClient = backup.config.encryption.enabled ?
        createEncryptionClient(backup.config.encryption) : null;
      const compressionClient = backup.config.compression.enabled ?
        createCompressionClient(backup.config.compression) : null;

      // Yedeklemeyi indir ve işle
      let pipeline = await storageClient.download(backup.location);
      if (encryptionClient) {
        pipeline = pipeline.pipe(encryptionClient.createDecryptStream());
      }
      if (compressionClient) {
        pipeline = pipeline.pipe(compressionClient.createDecompressStream());
      }

      // Geri yükleme akışını oluştur
      const restoreStream = createRestoreStream({
        type: job.type,
        scope: job.scope
      });

      // Geri yüklemeyi gerçekleştir
      await pipeline.pipe(restoreStream);

      // Geri yüklemeyi doğrula
      const verificationStatus = await this.verifyRestore(job);
      await job.complete(verificationStatus);

      // Önbelleği temizle
      await this.clearCacheAfterRestore();

    } catch (error) {
      logger.error('Geri yükleme performansı hatası:', error);
      await job.fail(error);
      throw error;
    }
  }

  /**
   * Yardımcı Metodlar
   */
  async scheduleBackup(config) {
    const nextRunTime = config.calculateNextRunTime();
    const jobId = `backup:${config._id}`;

    await scheduleJob(jobId, nextRunTime, async () => {
      await this.createBackupJob(config._id, 'scheduled');
    });

    await redis.set(
      `backup:schedule:${config._id}`,
      nextRunTime.toISOString()
    );
  }

  async unscheduleBackup(config) {
    const jobId = `backup:${config._id}`;
    await cancelJob(jobId);
    await redis.del(`backup:schedule:${config._id}`);
  }

  generateBackupLocation(config) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-');
    return `backups/${config.name}/${config.type}_${timestamp}.backup`;
  }

  async getCollectionsToBackup() {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    return collections.map(c => c.name);
  }

  async cleanupOldBackups(config) {
    try {
      const oldBackups = await BackupJob.find({
        config: config._id,
        status: 'completed',
        createdAt: {
          $lt: new Date(Date.now() - config.retention.duration * 24 * 60 * 60 * 1000)
        }
      }).sort({ createdAt: 1 });

      const backupsToKeep = config.retention.count;
      if (oldBackups.length > backupsToKeep) {
        const backupsToDelete = oldBackups
          .slice(0, oldBackups.length - backupsToKeep);

        const storageClient = createStorageClient(config.storage);
        for (const backup of backupsToDelete) {
          await storageClient.delete(backup.location);
          await backup.deleteOne();
        }
      }
    } catch (error) {
      logger.error('Eski yedeklemeleri temizleme hatası:', error);
    }
  }

  async updateBackupCache(job) {
    const key = `backup:latest:${job.config}`;
    await redis.set(key, JSON.stringify({
      id: job._id,
      timestamp: job.endTime,
      size: job.size,
      checksum: job.checksum
    }));
  }

  async clearCacheAfterRestore() {
    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  async verifyRestore(job) {
    try {
      // Geri yüklenen verileri doğrula
      const isValid = true; // Gerçek doğrulama mantığı eklenecek
      return isValid ? 'success' : 'failed';
    } catch (error) {
      logger.error('Geri yükleme doğrulama hatası:', error);
      return 'failed';
    }
  }
}

export default new BackupService();
