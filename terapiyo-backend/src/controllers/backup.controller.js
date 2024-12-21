import { validationResult } from 'express-validator';
import backupService from '../services/backup.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class BackupController {
  /**
   * Yedekleme Yapılandırması endpoint'leri
   */
  createBackupConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const config = await backupService.createBackupConfig(req.body);

    res.status(201).json({
      status: 'success',
      data: config
    });
  });

  updateBackupConfig = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const config = await backupService.updateBackupConfig(
      req.params.configId,
      req.body
    );

    res.json({
      status: 'success',
      data: config
    });
  });

  getBackupConfigs = catchAsync(async (req, res) => {
    const configs = await backupService.getBackupConfigs(req.query);

    res.json({
      status: 'success',
      data: configs
    });
  });

  /**
   * Yedekleme İşleri endpoint'leri
   */
  createBackupJob = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const job = await backupService.createBackupJob(
      req.params.configId,
      req.body.type
    );

    res.status(201).json({
      status: 'success',
      data: job
    });
  });

  getBackupJobs = catchAsync(async (req, res) => {
    const jobs = await backupService.getBackupJobs(req.query);

    res.json({
      status: 'success',
      data: jobs
    });
  });

  getBackupJobStatus = catchAsync(async (req, res) => {
    const job = await backupService.getBackupJobStatus(req.params.jobId);

    res.json({
      status: 'success',
      data: job
    });
  });

  /**
   * Geri Yükleme İşleri endpoint'leri
   */
  createRestoreJob = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const job = await backupService.createRestoreJob(
      req.params.backupId,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: job
    });
  });

  getRestoreJobs = catchAsync(async (req, res) => {
    const jobs = await backupService.getRestoreJobs(req.query);

    res.json({
      status: 'success',
      data: jobs
    });
  });

  getRestoreJobStatus = catchAsync(async (req, res) => {
    const job = await backupService.getRestoreJobStatus(req.params.jobId);

    res.json({
      status: 'success',
      data: job
    });
  });

  /**
   * Yedekleme İstatistikleri endpoint'i
   */
  getBackupStats = catchAsync(async (req, res) => {
    const stats = await backupService.getBackupStats();

    res.json({
      status: 'success',
      data: stats
    });
  });
}

export default new BackupController();
