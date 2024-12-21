import { validationResult } from 'express-validator';
import documentationService from '../services/documentation.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class DocumentationController {
  /**
   * API Endpoint endpoint'leri
   */
  createApiEndpoint = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const endpoint = await documentationService.createApiEndpoint(req.body);

    res.status(201).json({
      status: 'success',
      data: endpoint
    });
  });

  updateApiEndpoint = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const endpoint = await documentationService.updateApiEndpoint(
      req.params.endpointId,
      req.body
    );

    res.json({
      status: 'success',
      data: endpoint
    });
  });

  deprecateApiEndpoint = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const endpoint = await documentationService.deprecateApiEndpoint(
      req.params.endpointId,
      req.body.newVersion
    );

    res.json({
      status: 'success',
      data: endpoint
    });
  });

  /**
   * Documentation endpoint'leri
   */
  createDocumentation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const doc = await documentationService.createDocumentation({
      ...req.body,
      author: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

  updateDocumentation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const doc = await documentationService.updateDocumentation(
      req.params.docId,
      req.body
    );

    res.json({
      status: 'success',
      data: doc
    });
  });

  publishDocumentation = catchAsync(async (req, res) => {
    const doc = await documentationService.publishDocumentation(
      req.params.docId
    );

    res.json({
      status: 'success',
      data: doc
    });
  });

  /**
   * Feedback endpoint'leri
   */
  createFeedback = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const feedback = await documentationService.createFeedback({
      ...req.body,
      user: req.user?._id
    });

    res.status(201).json({
      status: 'success',
      data: feedback
    });
  });

  resolveFeedback = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const feedback = await documentationService.resolveFeedback(
      req.params.feedbackId,
      req.body.resolution
    );

    res.json({
      status: 'success',
      data: feedback
    });
  });

  /**
   * Changelog endpoint'leri
   */
  createChangelog = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const changelog = await documentationService.createChangelog({
      ...req.body,
      author: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: changelog
    });
  });

  publishChangelog = catchAsync(async (req, res) => {
    const changelog = await documentationService.publishChangelog(
      req.params.changelogId
    );

    res.json({
      status: 'success',
      data: changelog
    });
  });

  /**
   * Swagger Spec endpoint'i
   */
  getApiSpec = catchAsync(async (req, res) => {
    const spec = await documentationService.generateApiSpec();

    res.json({
      status: 'success',
      data: spec
    });
  });

  /**
   * Dokümantasyon Arama endpoint'i
   */
  searchDocumentation = catchAsync(async (req, res) => {
    const results = await documentationService.searchDocumentation(
      req.query.q
    );

    res.json({
      status: 'success',
      data: results
    });
  });
}

export default new DocumentationController();
