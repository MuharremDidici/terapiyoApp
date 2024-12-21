import File from '../models/file.model.js';
import storage from '../utils/storage.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class FileService {
  /**
   * Upload file
   */
  async uploadFile(userId, file, type, options = {}) {
    try {
      // Validate file
      const validation = storage.validateFile(file, options);
      if (!validation.isValid) {
        throw new ApiError(400, validation.errors.join(', '));
      }

      // Upload to S3
      const result = await storage.uploadFile(file, type, options);

      // Create file record
      const fileDoc = await File.create({
        owner: userId,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: result.size,
        path: result.key,
        url: result.url,
        bucket: result.bucket,
        key: result.key,
        type: type,
        metadata: result.metadata,
        security: {
          isPublic: options.isPublic || false
        }
      });

      // Mark as active after successful upload
      await fileDoc.markAsActive();

      return fileDoc;
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId, userId) {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw new ApiError(404, 'File not found');
      }

      if (!file.hasAccess(userId)) {
        throw new ApiError(403, 'Access denied');
      }

      if (file.security.isPublic) {
        return file;
      }

      // Generate signed URL if file is not public
      const signedUrl = await storage.generateSignedUrl(file.key);
      file.url = signedUrl;

      return file;
    } catch (error) {
      logger.error('Error getting file:', error);
      throw error;
    }
  }

  /**
   * Get user files
   */
  async getUserFiles(userId, filters = {}) {
    try {
      const {
        type,
        status = 'active',
        page = 1,
        limit = 20
      } = filters;

      const query = { owner: userId, status };
      if (type) query.type = type;

      const files = await File.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await File.countDocuments(query);

      return {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting user files:', error);
      throw error;
    }
  }

  /**
   * Update file access
   */
  async updateAccess(fileId, userId, accessData) {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw new ApiError(404, 'File not found');
      }

      if (file.owner.toString() !== userId.toString()) {
        throw new ApiError(403, 'Only owner can update access');
      }

      Object.assign(file.security, accessData);
      await file.save();

      return file;
    } catch (error) {
      logger.error('Error updating file access:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(fileId, userId) {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw new ApiError(404, 'File not found');
      }

      if (!file.hasAccess(userId, 'admin')) {
        throw new ApiError(403, 'Access denied');
      }

      // Soft delete file record
      await file.softDelete();

      // Delete from S3 (can be done asynchronously)
      storage.deleteFile(file.key).catch(error => {
        logger.error('Error deleting file from S3:', error);
      });

      return file;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(userId) {
    try {
      const usage = await File.getStorageUsage(userId);
      return {
        usage,
        limit: process.env.STORAGE_LIMIT || 1024 * 1024 * 1024 // 1GB default
      };
    } catch (error) {
      logger.error('Error getting storage usage:', error);
      throw error;
    }
  }

  /**
   * Share file
   */
  async shareFile(fileId, userId, shareData) {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw new ApiError(404, 'File not found');
      }

      if (!file.hasAccess(userId, 'admin')) {
        throw new ApiError(403, 'Access denied');
      }

      // Update access control
      file.security.accessControl.push({
        user: shareData.userId,
        permission: shareData.permission || 'read'
      });

      await file.save();

      return file;
    } catch (error) {
      logger.error('Error sharing file:', error);
      throw error;
    }
  }

  /**
   * Revoke file access
   */
  async revokeAccess(fileId, userId, targetUserId) {
    try {
      const file = await File.findById(fileId);
      if (!file) {
        throw new ApiError(404, 'File not found');
      }

      if (!file.hasAccess(userId, 'admin')) {
        throw new ApiError(403, 'Access denied');
      }

      file.security.accessControl = file.security.accessControl.filter(
        ac => ac.user.toString() !== targetUserId.toString()
      );

      await file.save();

      return file;
    } catch (error) {
      logger.error('Error revoking file access:', error);
      throw error;
    }
  }
}

export default new FileService();
