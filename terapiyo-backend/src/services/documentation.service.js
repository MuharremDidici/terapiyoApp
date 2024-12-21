import {
  ApiEndpoint,
  Documentation,
  DocumentationFeedback,
  Changelog
} from '../models/documentation.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { marked } from 'marked';
import pkg from 'sanitize-html';
const { sanitizeHtml } = pkg;
import { generateSwaggerSpec } from '../utils/swagger.js';

class DocumentationService {
  /**
   * API Endpoint işlemleri
   */
  async createApiEndpoint(data) {
    try {
      const endpoint = new ApiEndpoint(data);
      await endpoint.save();

      // Swagger dokümanını güncelle
      await this.updateSwaggerSpec();

      return endpoint;
    } catch (error) {
      logger.error('API endpoint oluşturma hatası:', error);
      throw error;
    }
  }

  async updateApiEndpoint(endpointId, updates) {
    try {
      const endpoint = await ApiEndpoint.findByIdAndUpdate(
        endpointId,
        updates,
        { new: true }
      );

      if (!endpoint) {
        throw new ApiError(404, 'API endpoint bulunamadı');
      }

      // Swagger dokümanını güncelle
      await this.updateSwaggerSpec();

      return endpoint;
    } catch (error) {
      logger.error('API endpoint güncelleme hatası:', error);
      throw error;
    }
  }

  async deprecateApiEndpoint(endpointId, newVersion) {
    try {
      const endpoint = await ApiEndpoint.findById(endpointId);
      if (!endpoint) {
        throw new ApiError(404, 'API endpoint bulunamadı');
      }

      await endpoint.deprecate(newVersion);

      // Swagger dokümanını güncelle
      await this.updateSwaggerSpec();

      return endpoint;
    } catch (error) {
      logger.error('API endpoint kullanımdan kaldırma hatası:', error);
      throw error;
    }
  }

  /**
   * Documentation işlemleri
   */
  async createDocumentation(data) {
    try {
      // Markdown içeriğini HTML'e dönüştür
      data.content = this.processMarkdown(data.content);

      const doc = new Documentation(data);
      await doc.save();

      // Önbelleği güncelle
      await this.updateDocumentationCache(doc);

      return doc;
    } catch (error) {
      logger.error('Dokümantasyon oluşturma hatası:', error);
      throw error;
    }
  }

  async updateDocumentation(docId, updates) {
    try {
      if (updates.content) {
        updates.content = this.processMarkdown(updates.content);
      }

      const doc = await Documentation.findByIdAndUpdate(
        docId,
        updates,
        { new: true }
      ).populate('author reviewers', 'name email');

      if (!doc) {
        throw new ApiError(404, 'Dokümantasyon bulunamadı');
      }

      // Önbelleği güncelle
      await this.updateDocumentationCache(doc);

      return doc;
    } catch (error) {
      logger.error('Dokümantasyon güncelleme hatası:', error);
      throw error;
    }
  }

  async publishDocumentation(docId) {
    try {
      const doc = await Documentation.findById(docId);
      if (!doc) {
        throw new ApiError(404, 'Dokümantasyon bulunamadı');
      }

      await doc.publish();

      // İlgili changelog'u güncelle
      await this.updateChangelogForDoc(doc);

      return doc;
    } catch (error) {
      logger.error('Dokümantasyon yayınlama hatası:', error);
      throw error;
    }
  }

  /**
   * Feedback işlemleri
   */
  async createFeedback(data) {
    try {
      const feedback = new DocumentationFeedback(data);
      await feedback.save();

      // İlgili dokümantasyonu güncelle
      await this.updateDocumentationMetrics(data.documentId);

      return feedback;
    } catch (error) {
      logger.error('Geri bildirim oluşturma hatası:', error);
      throw error;
    }
  }

  async resolveFeedback(feedbackId, resolution) {
    try {
      const feedback = await DocumentationFeedback.findById(feedbackId);
      if (!feedback) {
        throw new ApiError(404, 'Geri bildirim bulunamadı');
      }

      await feedback.resolve(resolution);
      return feedback;
    } catch (error) {
      logger.error('Geri bildirim çözme hatası:', error);
      throw error;
    }
  }

  /**
   * Changelog işlemleri
   */
  async createChangelog(data) {
    try {
      const changelog = new Changelog(data);
      await changelog.save();

      // İlgili dokümantasyonları güncelle
      for (const change of data.changes) {
        if (change.relatedDocs) {
          await this.updateRelatedDocs(change.relatedDocs, changelog);
        }
      }

      return changelog;
    } catch (error) {
      logger.error('Changelog oluşturma hatası:', error);
      throw error;
    }
  }

  async publishChangelog(changelogId) {
    try {
      const changelog = await Changelog.findById(changelogId);
      if (!changelog) {
        throw new ApiError(404, 'Changelog bulunamadı');
      }

      await changelog.publish();
      return changelog;
    } catch (error) {
      logger.error('Changelog yayınlama hatası:', error);
      throw error;
    }
  }

  /**
   * Swagger Spec işlemleri
   */
  async generateApiSpec() {
    try {
      const endpoints = await ApiEndpoint.find({
        deprecated: false
      }).sort({ path: 1 });

      const spec = generateSwaggerSpec(endpoints);

      // Swagger dokümanını önbelleğe al
      await redis.set('api:swagger:spec', JSON.stringify(spec), 'EX', 3600);

      return spec;
    } catch (error) {
      logger.error('API spec oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Dokümantasyon Arama
   */
  async searchDocumentation(query) {
    try {
      const searchRegex = new RegExp(query, 'i');

      const results = await Documentation.find({
        status: 'published',
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { tags: searchRegex }
        ]
      }).populate('author', 'name email')
        .sort({ updatedAt: -1 });

      return results;
    } catch (error) {
      logger.error('Dokümantasyon arama hatası:', error);
      throw error;
    }
  }

  /**
   * Yardımcı metodlar
   */
  processMarkdown(content) {
    // Markdown'ı HTML'e dönüştür
    const html = marked(content);

    // HTML'i temizle
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title']
      }
    });
  }

  async updateSwaggerSpec() {
    try {
      const spec = await this.generateApiSpec();
      await redis.set('api:swagger:spec', JSON.stringify(spec), 'EX', 3600);
    } catch (error) {
      logger.error('Swagger spec güncelleme hatası:', error);
    }
  }

  async updateDocumentationCache(doc) {
    const key = `doc:${doc._id}`;
    await redis.set(key, JSON.stringify(doc), 'EX', 3600);
  }

  async updateDocumentationMetrics(docId) {
    try {
      const [
        helpfulCount,
        issueCount,
        suggestionCount
      ] = await Promise.all([
        DocumentationFeedback.countDocuments({ documentId: docId, type: 'helpful' }),
        DocumentationFeedback.countDocuments({ documentId: docId, type: 'issue' }),
        DocumentationFeedback.countDocuments({ documentId: docId, type: 'suggestion' })
      ]);

      await Documentation.findByIdAndUpdate(docId, {
        $set: {
          'metadata.metrics': {
            helpfulCount,
            issueCount,
            suggestionCount,
            lastUpdated: new Date()
          }
        }
      });
    } catch (error) {
      logger.error('Dokümantasyon metrikleri güncelleme hatası:', error);
    }
  }

  async updateChangelogForDoc(doc) {
    try {
      const latestChangelog = await Changelog.findOne({
        status: 'draft'
      }).sort({ createdAt: -1 });

      if (latestChangelog) {
        latestChangelog.changes.push({
          type: 'changed',
          description: `"${doc.title}" dokümantasyonu güncellendi`,
          relatedDocs: [doc._id]
        });

        await latestChangelog.save();
      }
    } catch (error) {
      logger.error('Changelog güncelleme hatası:', error);
    }
  }

  async updateRelatedDocs(docIds, changelog) {
    try {
      await Documentation.updateMany(
        { _id: { $in: docIds } },
        {
          $set: {
            'metadata.lastChangelogUpdate': changelog.version
          }
        }
      );
    } catch (error) {
      logger.error('İlgili dokümanları güncelleme hatası:', error);
    }
  }
}

export default new DocumentationService();
