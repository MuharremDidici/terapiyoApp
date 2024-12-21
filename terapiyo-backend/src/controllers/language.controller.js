import { validationResult } from 'express-validator';
import languageService from '../services/language.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class LanguageController {
  /**
   * Translation endpoints
   */
  getTranslation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { key, language, context } = req.query;
    const translation = await languageService.getTranslation(
      key,
      language,
      context
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  setTranslation = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { key, language, value, context, tags } = req.body;
    const translation = await languageService.setTranslation(
      key,
      language,
      value,
      context,
      tags
    );

    res.json({
      status: 'success',
      data: translation
    });
  });

  /**
   * Language management endpoints
   */
  addLanguage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const language = await languageService.addLanguage(req.body);

    res.status(201).json({
      status: 'success',
      data: language
    });
  });

  getActiveLanguages = catchAsync(async (req, res) => {
    const languages = await languageService.getActiveLanguages();

    res.json({
      status: 'success',
      data: languages
    });
  });

  /**
   * User language preference endpoints
   */
  getUserLanguage = catchAsync(async (req, res) => {
    const userLang = await languageService.getUserLanguage(req.user.id);

    res.json({
      status: 'success',
      data: userLang
    });
  });

  updateUserLanguage = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const userLang = await languageService.updateUserLanguage(
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: userLang
    });
  });

  /**
   * Translation utility endpoints
   */
  detectAndTranslate = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const { text, targetLanguage } = req.body;
    const result = await languageService.detectAndTranslate(
      text,
      targetLanguage
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Bulk operation endpoints
   */
  bulkImportTranslations = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const result = await languageService.bulkImportTranslations(
      req.body.translations
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  bulkExportTranslations = catchAsync(async (req, res) => {
    const { language, context } = req.query;
    const translations = await languageService.bulkExportTranslations(
      language,
      context
    );

    res.json({
      status: 'success',
      data: translations
    });
  });
}

export default new LanguageController();
