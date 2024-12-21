import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import mime from 'mime-types';
import logger from '../config/logger.js';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

class StorageService {
  constructor(options = {}) {
    this.bucket = options.bucket || process.env.AWS_BUCKET_NAME;
    this.cdnDomain = options.cdnDomain || process.env.CDN_DOMAIN;
    this.imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  /**
   * Generate unique key for S3
   */
  generateKey(fileName, type) {
    const ext = path.extname(fileName);
    const uuid = uuidv4();
    return `${type}/${uuid}${ext}`.toLowerCase();
  }

  /**
   * Process image before upload
   */
  async processImage(buffer, options = {}) {
    try {
      const {
        width = 2000,
        height = 2000,
        quality = 80,
        format = 'webp'
      } = options;

      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if necessary
      if (metadata.width > width || metadata.height > height) {
        image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert to WebP for better compression
      const processed = await image
        .toFormat(format, { quality })
        .toBuffer();

      return {
        buffer: processed,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        }
      };
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(file, type, options = {}) {
    try {
      const key = this.generateKey(file.originalname, type);
      let buffer = file.buffer;
      let metadata = {};

      // Process image if applicable
      if (this.imageTypes.includes(file.mimetype)) {
        const processed = await this.processImage(buffer, options);
        buffer = processed.buffer;
        metadata = processed.metadata;
      }

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalname: file.originalname,
          ...metadata
        }
      });

      await s3Client.send(command);

      // Generate URLs
      const url = `https://${this.cdnDomain}/${key}`;
      const signedUrl = await this.generateSignedUrl(key);

      return {
        key,
        url,
        signedUrl,
        bucket: this.bucket,
        size: buffer.length,
        mimeType: file.mimetype,
        metadata
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Generate signed URL
   */
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Validate file
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [...this.imageTypes, ...this.documentTypes]
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size should not exceed ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get file type category
   */
  getFileType(mimetype) {
    if (this.imageTypes.includes(mimetype)) return 'image';
    if (this.documentTypes.includes(mimetype)) return 'document';
    return 'other';
  }

  /**
   * Check if file exists
   */
  async fileExists(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export instance and utility functions
const storageService = new StorageService();
export const createStorageClient = (options) => {
  return new StorageService(options);
};

export const uploadToS3 = (file, type, options) => {
  return storageService.uploadFile(file, type, options);
};

export const deleteFromS3 = (key) => {
  return storageService.deleteFile(key);
};

export const generateSignedUrl = (key, expiresIn) => {
  return storageService.generateSignedUrl(key, expiresIn);
};

export const validateFile = (file, options) => {
  return storageService.validateFile(file, options);
};

export default storageService;
