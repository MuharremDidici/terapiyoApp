import { validationResult } from 'express-validator';
import fileService from '../services/file.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class FileController {
  /**
   * Upload file
   * @route POST /api/v1/files
   */
  uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const file = await fileService.uploadFile(
      req.user.id,
      req.file,
      req.body.type,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: file
    });
  });

  /**
   * Get file by ID
   * @route GET /api/v1/files/:id
   */
  getFile = catchAsync(async (req, res) => {
    const file = await fileService.getFile(req.params.id, req.user.id);

    res.json({
      status: 'success',
      data: file
    });
  });

  /**
   * Get user files
   * @route GET /api/v1/files
   */
  getUserFiles = catchAsync(async (req, res) => {
    const result = await fileService.getUserFiles(req.user.id, req.query);

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Update file access
   * @route PATCH /api/v1/files/:id/access
   */
  updateAccess = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const file = await fileService.updateAccess(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: file
    });
  });

  /**
   * Delete file
   * @route DELETE /api/v1/files/:id
   */
  deleteFile = catchAsync(async (req, res) => {
    await fileService.deleteFile(req.params.id, req.user.id);

    res.json({
      status: 'success',
      message: 'File deleted'
    });
  });

  /**
   * Get storage usage
   * @route GET /api/v1/files/usage
   */
  getStorageUsage = catchAsync(async (req, res) => {
    const usage = await fileService.getStorageUsage(req.user.id);

    res.json({
      status: 'success',
      data: usage
    });
  });

  /**
   * Share file
   * @route POST /api/v1/files/:id/share
   */
  shareFile = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const file = await fileService.shareFile(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: file
    });
  });

  /**
   * Revoke file access
   * @route DELETE /api/v1/files/:id/access/:userId
   */
  revokeAccess = catchAsync(async (req, res) => {
    const file = await fileService.revokeAccess(
      req.params.id,
      req.user.id,
      req.params.userId
    );

    res.json({
      status: 'success',
      data: file
    });
  });
}

export default new FileController();
