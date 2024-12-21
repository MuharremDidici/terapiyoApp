import { validationResult } from 'express-validator';
import localizationService from '../services/localization.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class LocalizationController {
  /**
   * Dil endpoint'leri
   */
  createLanguage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const language = await localizationService.createLanguage(req.body);

    res.status(201).json({
      status: 'success',
      data: language
    });
  });

  updateLanguage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const language = await localizationService.updateLanguage(
      req.params.code,
      req.body
    );

    res.json({
      status: 'success',
      data: language
    });
  });

  setDefaultLanguage = catchAsync(async (req, res) => {
    const language = await localizationService.setDefaultLanguage(
      req.params.code
    );

    res.json({
      status: 'success',
      data: language
    });
  });

  getLanguages = catchAsync(async (req, res) => {
    const languages = await localizationService.getLanguages(req.query);

    res.json({
      status: 'success',
      data: languages
    });
  });

  /**
   * Çeviri Anahtarı endpoint'leri
   */
  createTranslationKey = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const key = await localizationService.createTranslationKey(req.body);

    res.status(201).json({
      status: 'success',
      data: key
    });
  });

  updateTranslationKey = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const key = await localizationService.updateTranslationKey(
      req.params.keyId,
      req.body
    );

    res.json({
      status: 'success',
      data: key
    });
  });

  getTranslationKeys = catchAsync(async (req, res) => {
    const keys = await localizationService.getTranslationKeys(req.query);

    res.json({
      status: 'success',
      data: keys
    });
  });

  /**
   * Çeviri endpoint'leri
   */
  createTranslation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const translation = await localizationService.createTranslation(req.body);

    res.status(201).json({
      status: 'success',
      data: translation
    });
  });

  updateTranslation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const translation = await localizationService.updateTranslation(
      req.params.translationId,
      req.body.value,
      req.user._id,
      req.body.comment
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  approveTranslation = catchAsync(async (req, res) => {
    const translation = await localizationService.approveTranslation(
      req.params.translationId,
      req.user._id
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  publishTranslation = catchAsync(async (req, res) => {
    const translation = await localizationService.publishTranslation(
      req.params.translationId
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  getTranslations = catchAsync(async (req, res) => {
    const translations = await localizationService.getTranslations(req.query);

    res.json({
      status: 'success',
      data: translations
    });
  });

  /**
   * İçerik endpoint'leri
   */
  createContent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const content = await localizationService.createContent(req.body);

    res.status(201).json({
      status: 'success',
      data: content
    });
  });

  updateContent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const content = await localizationService.updateContent(
      req.params.identifier,
      req.body
    );

    res.json({
      status: 'success',
      data: content
    });
  });

  getContent = catchAsync(async (req, res) => {
    const content = await localizationService.getContent(
      req.params.identifier,
      req.query.language || req.acceptsLanguages()[0]
    );

    res.json({
      status: 'success',
      data: content
    });
  });

  /**
   * Çeviri Alma endpoint'leri
   */
  getTranslation = catchAsync(async (req, res) => {
    const translation = await localizationService.getTranslation(
      req.params.key,
      req.query.language || req.acceptsLanguages()[0],
      req.query.variables
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  /**
   * İstatistik endpoint'leri
   */
  getStats = catchAsync(async (req, res) => {
    const stats = await localizationService.getStats();

    res.json({
      status: 'success',
      data: stats
    });
  });
}

export default new LocalizationController();
