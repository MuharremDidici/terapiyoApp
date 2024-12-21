import { validationResult } from 'express-validator';
import verificationService from '../services/verification.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class VerificationController {
  /**
   * Create certificate
   * @route POST /api/v1/verification/certificates
   */
  createCertificate = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const certificate = await verificationService.createCertificate(
      req.user.id,
      req.body,
      req.files
    );

    res.status(201).json({
      status: 'success',
      data: certificate
    });
  });

  /**
   * Get certificates
   * @route GET /api/v1/verification/certificates
   */
  getCertificates = catchAsync(async (req, res) => {
    const certificates = await verificationService.getCertificates(
      req.query.therapist || req.user.id,
      {
        type: req.query.type,
        status: req.query.status
      }
    );

    res.json({
      status: 'success',
      data: certificates
    });
  });

  /**
   * Update certificate
   * @route PATCH /api/v1/verification/certificates/:id
   */
  updateCertificate = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const certificate = await verificationService.updateCertificate(
      req.params.id,
      req.user.id,
      req.body,
      req.files
    );

    res.json({
      status: 'success',
      data: certificate
    });
  });

  /**
   * Create verification request
   * @route POST /api/v1/verification/requests
   */
  createVerificationRequest = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const request = await verificationService.createVerificationRequest(
      req.user.id,
      req.body.certificates
    );

    res.status(201).json({
      status: 'success',
      data: request
    });
  });

  /**
   * Get verification requests
   * @route GET /api/v1/verification/requests
   */
  getVerificationRequests = catchAsync(async (req, res) => {
    const requests = await verificationService.getVerificationRequests({
      therapist: req.user.role === 'therapist' ? req.user.id : req.query.therapist,
      status: req.query.status,
      reviewer: req.query.reviewer
    });

    res.json({
      status: 'success',
      data: requests
    });
  });

  /**
   * Submit verification request
   * @route POST /api/v1/verification/requests/:id/submit
   */
  submitVerificationRequest = catchAsync(async (req, res) => {
    const request = await verificationService.submitVerificationRequest(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: request
    });
  });

  /**
   * Assign verification request
   * @route POST /api/v1/verification/requests/:id/assign
   */
  assignVerificationRequest = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const request = await verificationService.assignVerificationRequest(
      req.params.id,
      req.body.reviewerId
    );

    res.json({
      status: 'success',
      data: request
    });
  });

  /**
   * Review verification request
   * @route POST /api/v1/verification/requests/:id/review
   */
  reviewVerificationRequest = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const request = await verificationService.reviewVerificationRequest(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: request
    });
  });

  /**
   * Create verification template
   * @route POST /api/v1/verification/templates
   */
  createTemplate = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const template = await verificationService.createTemplate(req.body);

    res.status(201).json({
      status: 'success',
      data: template
    });
  });

  /**
   * Get verification templates
   * @route GET /api/v1/verification/templates
   */
  getTemplates = catchAsync(async (req, res) => {
    const templates = await verificationService.getTemplates({
      type: req.query.type,
      issuer: req.query.issuer
    });

    res.json({
      status: 'success',
      data: templates
    });
  });

  /**
   * Verify certificate with API
   * @route POST /api/v1/verification/certificates/:id/verify/api
   */
  verifyWithApi = catchAsync(async (req, res) => {
    const certificate = await verificationService.verifyWithApi(req.params.id);

    res.json({
      status: 'success',
      data: {
        verified: certificate.status === 'verified'
      }
    });
  });

  /**
   * Verify certificate with blockchain
   * @route POST /api/v1/verification/certificates/:id/verify/blockchain
   */
  verifyWithBlockchain = catchAsync(async (req, res) => {
    const certificate = await verificationService.verifyWithBlockchain(req.params.id);

    res.json({
      status: 'success',
      data: {
        verified: certificate.status === 'verified'
      }
    });
  });
}

export default new VerificationController();
