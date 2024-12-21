import {
  LocalizationLanguage,
  TranslationKey,
  LocalizationTranslation,
  Content
} from '../models/localization.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { marked } from 'marked';
import sanitizeHtmlPkg from 'sanitize-html';
const sanitizeHtml = sanitizeHtmlPkg;
import { formatMessage } from '../utils/message-formatter.js';

class LocalizationService {
  /**
   * Dil İşlemleri
   */
  async createLanguage(data) {
    try {
      const language = new LocalizationLanguage(data);
      await language.save();

      // Varsayılan dil olarak ayarlandıysa
      if (data.default) {
        await language.setAsDefault();
      }

      // Önbelleği güncelle
      await this.updateLanguageCache();

      return language;
    } catch (error) {
      logger.error('Dil oluşturma hatası:', error);
      throw error;
    }
  }

  async updateLanguage(code, updates) {
    try {
      const language = await LocalizationLanguage.findOne({ code });
      if (!language) {
        throw new ApiError(404, 'Dil bulunamadı');
      }

      Object.assign(language, updates);
      await language.save();

      // Önbelleği güncelle
      await this.updateLanguageCache();

      return language;
    } catch (error) {
      logger.error('Dil güncelleme hatası:', error);
      throw error;
    }
  }

  async setDefaultLanguage(code) {
    try {
      const language = await LocalizationLanguage.findOne({ code });
      if (!language) {
        throw new ApiError(404, 'Dil bulunamadı');
      }

      await language.setAsDefault();

      // Önbelleği güncelle
      await this.updateLanguageCache();

      return language;
    } catch (error) {
      logger.error('Varsayılan dil ayarlama hatası:', error);
      throw error;
    }
  }

  /**
   * Çeviri Anahtarı İşlemleri
   */
  async createTranslationKey(data) {
    try {
      const key = new TranslationKey(data);
      await key.save();

      // Tüm aktif diller için çeviri girişleri oluştur
      const languages = await LocalizationLanguage.find({ active: true });
      await Promise.all(languages.map(lang =>
        this.createTranslation({
          key: key._id,
          language: lang.code,
          value: ''
        })
      ));

      return key;
    } catch (error) {
      logger.error('Çeviri anahtarı oluşturma hatası:', error);
      throw error;
    }
  }

  async updateTranslationKey(keyId, updates) {
    try {
      const key = await TranslationKey.findById(keyId);
      if (!key) {
        throw new ApiError(404, 'Çeviri anahtarı bulunamadı');
      }

      Object.assign(key, updates);
      await key.save();

      return key;
    } catch (error) {
      logger.error('Çeviri anahtarı güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Çeviri İşlemleri
   */
  async createTranslation(data) {
    try {
      const translation = new LocalizationTranslation(data);
      await translation.save();

      // Önbelleği güncelle
      if (translation.status === 'published') {
        await this.updateTranslationCache(translation);
      }

      return translation;
    } catch (error) {
      logger.error('Çeviri oluşturma hatası:', error);
      throw error;
    }
  }

  async updateTranslation(translationId, value, userId, comment) {
    try {
      const translation = await LocalizationTranslation.findById(translationId);
      if (!translation) {
        throw new ApiError(404, 'Çeviri bulunamadı');
      }

      await translation.updateValue(value, userId, comment);

      // Önbelleği güncelle
      if (translation.status === 'published') {
        await this.updateTranslationCache(translation);
      }

      return translation;
    } catch (error) {
      logger.error('Çeviri güncelleme hatası:', error);
      throw error;
    }
  }

  async approveTranslation(translationId, userId) {
    try {
      const translation = await LocalizationTranslation.findById(translationId);
      if (!translation) {
        throw new ApiError(404, 'Çeviri bulunamadı');
      }

      await translation.approve(userId);
      return translation;
    } catch (error) {
      logger.error('Çeviri onaylama hatası:', error);
      throw error;
    }
  }

  async publishTranslation(translationId) {
    try {
      const translation = await LocalizationTranslation.findById(translationId);
      if (!translation) {
        throw new ApiError(404, 'Çeviri bulunamadı');
      }

      await translation.publish();

      // Önbelleği güncelle
      await this.updateTranslationCache(translation);

      return translation;
    } catch (error) {
      logger.error('Çeviri yayınlama hatası:', error);
      throw error;
    }
  }

  /**
   * İçerik İşlemleri
   */
  async createContent(data) {
    try {
      // HTML içeriğini temizle
      if (data.type === 'page' || data.type === 'email') {
        for (const [lang, content] of data.content.entries()) {
          data.content.set(lang, this.sanitizeContent(content));
        }
      }

      const content = new Content(data);
      await content.save();

      // Önbelleği güncelle
      if (content.status === 'published') {
        await this.updateContentCache(content);
      }

      return content;
    } catch (error) {
      logger.error('İçerik oluşturma hatası:', error);
      throw error;
    }
  }

  async updateContent(identifier, updates) {
    try {
      const content = await Content.findOne({ identifier });
      if (!content) {
        throw new ApiError(404, 'İçerik bulunamadı');
      }

      // Yeni versiyon oluştur
      const newVersion = await content.createNewVersion();
      Object.assign(newVersion, updates);

      // HTML içeriğini temizle
      if (newVersion.type === 'page' || newVersion.type === 'email') {
        for (const [lang, content] of newVersion.content.entries()) {
          newVersion.content.set(lang, this.sanitizeContent(content));
        }
      }

      await newVersion.save();

      return newVersion;
    } catch (error) {
      logger.error('İçerik güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Çeviri Alma İşlemleri
   */
  async getTranslation(key, language, variables = {}) {
    try {
      // Önbellekten çeviriyi al
      const cacheKey = `translation:${language}:${key}`;
      let translation = await redis.get(cacheKey);

      if (!translation) {
        // Veritabanından çeviriyi al
        const translationDoc = await LocalizationTranslation.findOne({
          key,
          language,
          status: 'published'
        }).populate('key');

        if (!translationDoc) {
          // Yedek dile bak
          const langDoc = await LocalizationLanguage.findOne({ code: language });
          if (langDoc?.fallback) {
            return this.getTranslation(key, langDoc.fallback, variables);
          }
          throw new ApiError(404, 'Çeviri bulunamadı');
        }

        translation = translationDoc.value;
        
        // Önbelleğe al
        await redis.set(cacheKey, translation, 'EX', 3600);
      }

      // Değişkenleri yerleştir
      return formatMessage(translation, variables);
    } catch (error) {
      logger.error('Çeviri alma hatası:', error);
      throw error;
    }
  }

  async getContent(identifier, language) {
    try {
      // Önbellekten içeriği al
      const cacheKey = `content:${identifier}:${language}`;
      let content = await redis.get(cacheKey);

      if (!content) {
        // Veritabanından içeriği al
        const contentDoc = await Content.findOne({
          identifier,
          status: 'published'
        });

        if (!contentDoc) {
          throw new ApiError(404, 'İçerik bulunamadı');
        }

        content = contentDoc.content.get(language);
        if (!content) {
          // Varsayılan dile bak
          const defaultLang = await LocalizationLanguage.findOne({ default: true });
          content = contentDoc.content.get(defaultLang.code);
        }

        // Önbelleğe al
        await redis.set(cacheKey, content, 'EX', 3600);
      }

      return content;
    } catch (error) {
      logger.error('İçerik alma hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı Metodlar
   */
  async updateLanguageCache() {
    try {
      const languages = await LocalizationLanguage.find({ active: true });
      await redis.set(
        'languages',
        JSON.stringify(languages),
        'EX',
        3600
      );
    } catch (error) {
      logger.error('Dil önbelleği güncelleme hatası:', error);
    }
  }

  async updateTranslationCache(translation) {
    try {
      const cacheKey = `translation:${translation.language}:${translation.key}`;
      await redis.set(cacheKey, translation.value, 'EX', 3600);
    } catch (error) {
      logger.error('Çeviri önbelleği güncelleme hatası:', error);
    }
  }

  async updateContentCache(content) {
    try {
      for (const [lang, value] of content.content.entries()) {
        const cacheKey = `content:${content.identifier}:${lang}`;
        await redis.set(cacheKey, value, 'EX', 3600);
      }
    } catch (error) {
      logger.error('İçerik önbelleği güncelleme hatası:', error);
    }
  }

  sanitizeContent(content) {
    if (typeof content === 'string') {
      // Markdown'ı HTML'e dönüştür
      const html = marked(content);

      // HTML'i temizle
      return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          'img', 'h1', 'h2', 'h3'
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title']
        }
      });
    }
    return content;
  }
}

export default new LocalizationService();
