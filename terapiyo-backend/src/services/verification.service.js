import { Certificate, VerificationRequest, VerificationTemplate } from '../models/verification.model.js';
import { redis } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { sendEmail } from '../utils/email.js';
import { uploadToS3, deleteFromS3 } from '../utils/storage.js';
import { verifyWithBlockchain } from '../utils/blockchain.js';
import { verifyWithExternalApi } from '../utils/external-api.js';

class VerificationService {
  /**
   * Certificate Management
   */
  async createCertificate(therapistId, data, files) {
    try {
      // Upload documents
      const documents = await Promise.all(
        files.map(async file => {
          const fileUrl = await uploadToS3(file, 'certificates');
          return {
            type: file.type,
            fileUrl,
            mimeType: file.mimetype,
            size: file.size
          };
        })
      );

      const certificate = await Certificate.create({
        therapist: therapistId,
        ...data,
        documents
      });

      return certificate;
    } catch (error) {
      logger.error('Certificate creation failed:', error);
      throw error;
    }
  }

  async getCertificates(therapistId, filters = {}) {
    try {
      const query = { therapist: therapistId };

      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.status) {
        query.status = filters.status;
      }

      const certificates = await Certificate.find(query)
        .sort('-createdAt')
        .populate('verificationDetails.verifiedBy', 'firstName lastName');

      return certificates;
    } catch (error) {
      logger.error('Certificates retrieval failed:', error);
      throw error;
    }
  }

  async updateCertificate(certificateId, therapistId, updates, files = []) {
    try {
      const certificate = await Certificate.findOne({
        _id: certificateId,
        therapist: therapistId
      });

      if (!certificate) {
        throw new ApiError(404, 'Certificate not found');
      }

      // Handle document updates
      if (files.length > 0) {
        // Delete old documents from S3
        await Promise.all(
          certificate.documents.map(doc =>
            deleteFromS3(doc.fileUrl)
          )
        );

        // Upload new documents
        const documents = await Promise.all(
          files.map(async file => {
            const fileUrl = await uploadToS3(file, 'certificates');
            return {
              type: file.type,
              fileUrl,
              mimeType: file.mimetype,
              size: file.size
            };
          })
        );

        updates.documents = documents;
      }

      // Reset verification if critical fields are updated
      if (updates.identifier || updates.issuer) {
        updates.status = 'pending';
        updates.verificationDetails = undefined;
      }

      Object.assign(certificate, updates);
      await certificate.save();

      return certificate;
    } catch (error) {
      logger.error('Certificate update failed:', error);
      throw error;
    }
  }

  /**
   * Verification Request Management
   */
  async createVerificationRequest(therapistId, certificateIds) {
    try {
      // Check if certificates exist and belong to therapist
      const certificates = await Certificate.find({
        _id: { $in: certificateIds },
        therapist: therapistId
      });

      if (certificates.length !== certificateIds.length) {
        throw new ApiError(400, 'Invalid certificate IDs');
      }

      const request = await VerificationRequest.create({
        therapist: therapistId,
        certificates: certificateIds
      });

      return request;
    } catch (error) {
      logger.error('Verification request creation failed:', error);
      throw error;
    }
  }

  async getVerificationRequests(filters = {}) {
    try {
      const query = {};

      if (filters.therapist) {
        query.therapist = filters.therapist;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.reviewer) {
        query['reviewDetails.assignedTo'] = filters.reviewer;
      }

      const requests = await VerificationRequest.find(query)
        .populate('therapist', 'firstName lastName email')
        .populate('certificates')
        .populate('reviewDetails.assignedTo', 'firstName lastName')
        .sort('-createdAt');

      return requests;
    } catch (error) {
      logger.error('Verification requests retrieval failed:', error);
      throw error;
    }
  }

  async submitVerificationRequest(requestId, therapistId) {
    try {
      const request = await VerificationRequest.findOne({
        _id: requestId,
        therapist: therapistId,
        status: 'draft'
      });

      if (!request) {
        throw new ApiError(404, 'Verification request not found');
      }

      await request.submit();

      // Notify admins
      await this.#notifyAdminsOfNewRequest(request);

      return request;
    } catch (error) {
      logger.error('Verification request submission failed:', error);
      throw error;
    }
  }

  async assignVerificationRequest(requestId, reviewerId) {
    try {
      const request = await VerificationRequest.findOne({
        _id: requestId,
        status: 'submitted'
      });

      if (!request) {
        throw new ApiError(404, 'Verification request not found');
      }

      request.status = 'in_review';
      request.reviewDetails = {
        assignedTo: reviewerId,
        startedAt: new Date()
      };
      await request.save();

      return request;
    } catch (error) {
      logger.error('Verification request assignment failed:', error);
      throw error;
    }
  }

  async reviewVerificationRequest(requestId, reviewerId, decision) {
    try {
      const request = await VerificationRequest.findOne({
        _id: requestId,
        'reviewDetails.assignedTo': reviewerId,
        status: 'in_review'
      }).populate('certificates');

      if (!request) {
        throw new ApiError(404, 'Verification request not found');
      }

      request.status = decision.status;
      request.reviewDetails.completedAt = new Date();
      request.reviewDetails.decision = decision;
      request.submissionDetails.completedAt = new Date();

      // Update certificate statuses
      await Promise.all(
        request.certificates.map(async cert => {
          cert.status = decision.status === 'approved' ? 'verified' : 'rejected';
          if (decision.status === 'approved') {
            await cert.verify(reviewerId, 'manual', decision.notes);
          }
          await cert.save();
        })
      );

      await request.save();

      // Notify therapist
      await this.#notifyTherapistOfDecision(request);

      return request;
    } catch (error) {
      logger.error('Verification request review failed:', error);
      throw error;
    }
  }

  /**
   * Template Management
   */
  async createTemplate(data) {
    try {
      const template = await VerificationTemplate.create(data);
      return template;
    } catch (error) {
      logger.error('Template creation failed:', error);
      throw error;
    }
  }

  async getTemplates(filters = {}) {
    try {
      const query = {};

      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.issuer) {
        query['issuer.name'] = filters.issuer;
      }

      const templates = await VerificationTemplate.find(query)
        .sort('name');

      return templates;
    } catch (error) {
      logger.error('Templates retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Verification Methods
   */
  async verifyWithApi(certificate) {
    try {
      const template = await VerificationTemplate.findOne({
        type: certificate.type,
        'issuer.name': certificate.issuer.name
      });

      if (!template || !template.issuer.apiConfig) {
        throw new ApiError(400, 'API verification not available for this certificate');
      }

      const isValid = await verifyWithExternalApi(
        certificate,
        template.issuer.apiConfig
      );

      if (isValid) {
        await certificate.verify(null, 'api');
      }

      return isValid;
    } catch (error) {
      logger.error('API verification failed:', error);
      throw error;
    }
  }

  async verifyWithBlockchain(certificate) {
    try {
      const isValid = await verifyWithBlockchain(certificate);

      if (isValid) {
        await certificate.verify(null, 'blockchain');
      }

      return isValid;
    } catch (error) {
      logger.error('Blockchain verification failed:', error);
      throw error;
    }
  }

  /**
   * Notification Methods
   */
  async #notifyAdminsOfNewRequest(request) {
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'new-verification-request',
        {
          requestId: request._id,
          therapistName: `${request.therapist.firstName} ${request.therapist.lastName}`,
          certificateCount: request.certificates.length
        }
      );
    } catch (error) {
      logger.error('Admin notification failed:', error);
    }
  }

  async #notifyTherapistOfDecision(request) {
    try {
      await sendEmail(
        request.therapist.email,
        `verification-${request.status}`,
        {
          requestId: request._id,
          decision: request.status,
          feedback: request.feedback
        }
      );
    } catch (error) {
      logger.error('Therapist notification failed:', error);
    }
  }

  /**
   * Maintenance Methods
   */
  async checkExpiringCertificates() {
    try {
      const expiringCertificates = await Certificate.findExpiring();

      for (const cert of expiringCertificates) {
        await sendEmail(
          cert.therapist.email,
          'certificate-expiring',
          {
            certificateTitle: cert.title,
            expiryDate: cert.identifier.expiresAt
          }
        );
      }
    } catch (error) {
      logger.error('Expiring certificates check failed:', error);
      throw error;
    }
  }
}

export default new VerificationService();
