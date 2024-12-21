import { Router } from 'express';
import { body, query, param } from 'express-validator';
import verificationController from '../controllers/verification.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * Certificate routes
 */
router.post(
  '/certificates',
  authenticate,
  authorize(['therapist']),
  upload.array('documents'),
  [
    body('type').isIn(['degree', 'license', 'certification', 'specialization', 'training']),
    body('title').isString().trim().notEmpty(),
    body('issuer.name').isString().trim().notEmpty(),
    body('issuer.country').optional().isString(),
    body('issuer.website').optional().isURL(),
    body('issuer.verificationUrl').optional().isURL(),
    body('identifier.number').isString().trim().notEmpty(),
    body('identifier.issuedAt').isISO8601(),
    body('identifier.expiresAt').optional().isISO8601(),
    body('specialties').optional().isArray(),
    body('specialties.*').isString()
  ],
  verificationController.createCertificate
);

router.get(
  '/certificates',
  authenticate,
  [
    query('therapist').optional().isMongoId(),
    query('type').optional().isIn(['degree', 'license', 'certification', 'specialization', 'training']),
    query('status').optional().isIn(['pending', 'verified', 'rejected', 'expired'])
  ],
  verificationController.getCertificates
);

router.patch(
  '/certificates/:id',
  authenticate,
  authorize(['therapist']),
  upload.array('documents'),
  [
    param('id').isMongoId(),
    body('type').optional().isIn(['degree', 'license', 'certification', 'specialization', 'training']),
    body('title').optional().isString().trim().notEmpty(),
    body('issuer').optional().isObject(),
    body('identifier').optional().isObject(),
    body('specialties').optional().isArray(),
    body('specialties.*').isString()
  ],
  verificationController.updateCertificate
);

/**
 * Verification request routes
 */
router.post(
  '/requests',
  authenticate,
  authorize(['therapist']),
  [
    body('certificates').isArray().notEmpty(),
    body('certificates.*').isMongoId()
  ],
  verificationController.createVerificationRequest
);

router.get(
  '/requests',
  authenticate,
  [
    query('therapist').optional().isMongoId(),
    query('status').optional().isIn(['draft', 'submitted', 'in_review', 'approved', 'rejected']),
    query('reviewer').optional().isMongoId()
  ],
  verificationController.getVerificationRequests
);

router.post(
  '/requests/:id/submit',
  authenticate,
  authorize(['therapist']),
  [
    param('id').isMongoId()
  ],
  verificationController.submitVerificationRequest
);

router.post(
  '/requests/:id/assign',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    param('id').isMongoId(),
    body('reviewerId').isMongoId()
  ],
  verificationController.assignVerificationRequest
);

router.post(
  '/requests/:id/review',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    param('id').isMongoId(),
    body('status').isIn(['approved', 'rejected']),
    body('reason').isString().trim().notEmpty(),
    body('notes').optional().isString()
  ],
  verificationController.reviewVerificationRequest
);

/**
 * Template routes
 */
router.post(
  '/templates',
  authenticate,
  authorize(['admin']),
  [
    body('name').isString().trim().notEmpty(),
    body('type').isIn(['degree', 'license', 'certification', 'specialization', 'training']),
    body('issuer').isObject(),
    body('issuer.name').isString().trim().notEmpty(),
    body('requiredDocuments').isArray(),
    body('requiredDocuments.*.type').isIn(['certificate', 'transcript', 'license', 'other']),
    body('validationRules').optional().isArray()
  ],
  verificationController.createTemplate
);

router.get(
  '/templates',
  authenticate,
  [
    query('type').optional().isIn(['degree', 'license', 'certification', 'specialization', 'training']),
    query('issuer').optional().isString()
  ],
  verificationController.getTemplates
);

/**
 * Verification method routes
 */
router.post(
  '/certificates/:id/verify/api',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    param('id').isMongoId()
  ],
  verificationController.verifyWithApi
);

router.post(
  '/certificates/:id/verify/blockchain',
  authenticate,
  authorize(['admin', 'moderator']),
  [
    param('id').isMongoId()
  ],
  verificationController.verifyWithBlockchain
);

export default router;
