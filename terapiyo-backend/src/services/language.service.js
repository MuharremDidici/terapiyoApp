import {
  Translation,
  Language,
  UserLanguage
} from '../models/language.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { detectLanguage } from '../utils/language/detect.js';
import { translateText } from '../utils/language/translate.js';

class LanguageService {
  /**
   * Translation Management
   */
  async getTranslation(key, language, context = 'general') {
    try {
      // Check cache first
      const cacheKey = `translation:${language}:${key}`;
      const cachedTranslation = await redis.get(cacheKey);
      if (cachedTranslation) {
        return JSON.parse(cachedTranslation);
      }

      // Get from database
      const translation = await Translation.findOne({
        key,
        language,
        context
      });

      if (!translation) {
        // Try fallback language
        const userLang = await Language.findOne({ code: language });
        if (userLang && userLang.defaultFallback) {
          return this.getTranslation(key, userLang.defaultFallback, context);
        }
        throw new ApiError(404, 'Translation not found');
      }

      // Cache translation
      await redis.setex(
        cacheKey,
        3600, // 1 hour
        JSON.stringify(translation)
      );

      return translation;
    } catch (error) {
      logger.error('Translation retrieval failed:', error);
      throw error;
    }
  }

  async setTranslation(key, language, value, context = 'general', tags = []) {
    try {
      let translation = await Translation.findOne({ key, language });

      if (!translation) {
        translation = new Translation({
          key,
          language,
          value,
          context,
          tags
        });
      } else {
        translation.value = value;
        translation.context = context;
        translation.tags = tags;
        translation.metadata.lastUpdated = new Date();
      }

      await translation.save();

      // Invalidate cache
      await redis.del(`translation:${language}:${key}`);

      return translation;
    } catch (error) {
      logger.error('Translation update failed:', error);
      throw error;
    }
  }

  /**
   * Language Management
   */
  async addLanguage(languageData) {
    try {
      const language = new Language(languageData);
      await language.save();

      // Invalidate cache
      await redis.del('languages:active');

      return language;
    } catch (error) {
      logger.error('Language addition failed:', error);
      throw error;
    }
  }

  async getActiveLanguages() {
    try {
      // Check cache
      const cachedLanguages = await redis.get('languages:active');
      if (cachedLanguages) {
        return JSON.parse(cachedLanguages);
      }

      const languages = await Language.find({ active: true });

      // Cache languages
      await redis.setex(
        'languages:active',
        3600, // 1 hour
        JSON.stringify(languages)
      );

      return languages;
    } catch (error) {
      logger.error('Active languages retrieval failed:', error);
      throw error;
    }
  }

  /**
   * User Language Preferences
   */
  async getUserLanguage(userId) {
    try {
      let userLang = await UserLanguage.findOne({ user: userId });

      if (!userLang) {
        // Create default user language preferences
        userLang = await UserLanguage.create({
          user: userId,
          preferredLanguage: 'tr',
          fallbackLanguages: ['en'],
          autoDetect: true
        });
      }

      return userLang;
    } catch (error) {
      logger.error('User language retrieval failed:', error);
      throw error;
    }
  }

  async updateUserLanguage(userId, preferences) {
    try {
      let userLang = await UserLanguage.findOne({ user: userId });

      if (!userLang) {
        userLang = new UserLanguage({
          user: userId,
          ...preferences
        });
      } else {
        Object.assign(userLang, preferences);
      }

      await userLang.save();

      // Invalidate cache
      await redis.del(`user:${userId}:language`);

      return userLang;
    } catch (error) {
      logger.error('User language update failed:', error);
      throw error;
    }
  }

  /**
   * Language Detection and Translation
   */
  async detectAndTranslate(text, targetLanguage) {
    try {
      const detectedLanguage = await detectLanguage(text);
      
      if (detectedLanguage === targetLanguage) {
        return {
          text,
          sourceLanguage: detectedLanguage,
          translated: false
        };
      }

      const translatedText = await translateText(text, detectedLanguage, targetLanguage);

      return {
        text: translatedText,
        sourceLanguage: detectedLanguage,
        translated: true
      };
    } catch (error) {
      logger.error('Language detection and translation failed:', error);
      throw error;
    }
  }

  /**
   * Bulk Operations
   */
  async bulkImportTranslations(translations) {
    try {
      const operations = translations.map(translation => ({
        updateOne: {
          filter: {
            key: translation.key,
            language: translation.language
          },
          update: {
            $set: translation
          },
          upsert: true
        }
      }));

      const result = await Translation.bulkWrite(operations);

      // Invalidate affected cache keys
      const cacheKeys = translations.map(
        t => `translation:${t.language}:${t.key}`
      );
      await redis.del(cacheKeys);

      return result;
    } catch (error) {
      logger.error('Bulk translation import failed:', error);
      throw error;
    }
  }

  async bulkExportTranslations(language, context = null) {
    try {
      const query = { language };
      if (context) {
        query.context = context;
      }

      return Translation.find(query)
        .select('-_id key value context tags')
        .lean();
    } catch (error) {
      logger.error('Bulk translation export failed:', error);
      throw error;
    }
  }
}

export default new LanguageService();
