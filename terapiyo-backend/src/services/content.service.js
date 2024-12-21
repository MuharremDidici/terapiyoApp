import { Category, Tag, Article, Resource } from '../models/content.model.js';
import { redis } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class ContentService {
  /**
   * Category operations
   */
  async createCategory(data) {
    try {
      const category = await Category.create(data);
      await this.#clearCategoryCache();
      return category;
    } catch (error) {
      logger.error('Category creation failed:', error);
      throw error;
    }
  }

  async getCategories(includeInactive = false) {
    try {
      const cacheKey = `categories:${includeInactive}`;
      let categories = await redis.get(cacheKey);

      if (!categories) {
        const query = includeInactive ? {} : { isActive: true };
        categories = await Category.find(query)
          .populate('parent')
          .sort('order');

        await redis.set(cacheKey, JSON.stringify(categories), 'EX', 3600);
      } else {
        categories = JSON.parse(categories);
      }

      return categories;
    } catch (error) {
      logger.error('Categories retrieval failed:', error);
      throw error;
    }
  }

  async updateCategory(id, data) {
    try {
      const category = await Category.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });

      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      await this.#clearCategoryCache();
      return category;
    } catch (error) {
      logger.error('Category update failed:', error);
      throw error;
    }
  }

  /**
   * Tag operations
   */
  async createTag(data) {
    try {
      const tag = await Tag.create(data);
      await this.#clearTagCache();
      return tag;
    } catch (error) {
      logger.error('Tag creation failed:', error);
      throw error;
    }
  }

  async getTags() {
    try {
      const cacheKey = 'tags';
      let tags = await redis.get(cacheKey);

      if (!tags) {
        tags = await Tag.find().sort('-count');
        await redis.set(cacheKey, JSON.stringify(tags), 'EX', 3600);
      } else {
        tags = JSON.parse(tags);
      }

      return tags;
    } catch (error) {
      logger.error('Tags retrieval failed:', error);
      throw error;
    }
  }

  async updateTag(id, data) {
    try {
      const tag = await Tag.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });

      if (!tag) {
        throw new ApiError(404, 'Tag not found');
      }

      await this.#clearTagCache();
      return tag;
    } catch (error) {
      logger.error('Tag update failed:', error);
      throw error;
    }
  }

  /**
   * Article operations
   */
  async createArticle(data) {
    try {
      const article = await Article.create(data);
      await article.updateMetadata();

      // Update tag counts
      if (data.tags) {
        await Tag.updateMany(
          { _id: { $in: data.tags } },
          { $inc: { count: 1 } }
        );
        await this.#clearTagCache();
      }

      return article;
    } catch (error) {
      logger.error('Article creation failed:', error);
      throw error;
    }
  }

  async getArticles(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = '-publishedAt'
      } = options;

      const query = { status: 'published' };

      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.tags?.length) {
        query.tags = { $in: filters.tags };
      }
      if (filters.author) {
        query.author = filters.author;
      }

      const articles = await Article.find(query)
        .populate('author', 'firstName lastName avatar')
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Article.countDocuments(query);

      return {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Articles retrieval failed:', error);
      throw error;
    }
  }

  async getArticle(slug) {
    try {
      const cacheKey = `article:${slug}`;
      let article = await redis.get(cacheKey);

      if (!article) {
        article = await Article.findOne({ slug, status: 'published' })
          .populate('author', 'firstName lastName avatar bio')
          .populate('category', 'name slug')
          .populate('tags', 'name slug')
          .populate('relatedArticles', 'title slug featuredImage');

        if (!article) {
          throw new ApiError(404, 'Article not found');
        }

        await redis.set(cacheKey, JSON.stringify(article), 'EX', 3600);
      } else {
        article = JSON.parse(article);
      }

      // Increment views asynchronously
      article.incrementViews();

      return article;
    } catch (error) {
      logger.error('Article retrieval failed:', error);
      throw error;
    }
  }

  async updateArticle(id, data) {
    try {
      const article = await Article.findById(id);
      if (!article) {
        throw new ApiError(404, 'Article not found');
      }

      // Handle tag changes
      if (data.tags) {
        const removedTags = article.tags.filter(t => !data.tags.includes(t.toString()));
        const addedTags = data.tags.filter(t => !article.tags.includes(t));

        if (removedTags.length) {
          await Tag.updateMany(
            { _id: { $in: removedTags } },
            { $inc: { count: -1 } }
          );
        }
        if (addedTags.length) {
          await Tag.updateMany(
            { _id: { $in: addedTags } },
            { $inc: { count: 1 } }
          );
        }
        await this.#clearTagCache();
      }

      Object.assign(article, data);
      await article.save();
      await article.updateMetadata();

      // Clear cache
      await redis.del(`article:${article.slug}`);

      return article;
    } catch (error) {
      logger.error('Article update failed:', error);
      throw error;
    }
  }

  /**
   * Resource operations
   */
  async createResource(data) {
    try {
      const resource = await Resource.create(data);

      // Update tag counts
      if (data.tags) {
        await Tag.updateMany(
          { _id: { $in: data.tags } },
          { $inc: { count: 1 } }
        );
        await this.#clearTagCache();
      }

      return resource;
    } catch (error) {
      logger.error('Resource creation failed:', error);
      throw error;
    }
  }

  async getResources(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sort = '-createdAt'
      } = options;

      const query = {};

      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.tags?.length) {
        query.tags = { $in: filters.tags };
      }
      if (filters.access) {
        query.access = filters.access;
      }

      const resources = await Resource.find(query)
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'firstName lastName')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Resource.countDocuments(query);

      return {
        resources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Resources retrieval failed:', error);
      throw error;
    }
  }

  async getResource(slug) {
    try {
      const resource = await Resource.findOne({ slug })
        .populate('category', 'name slug')
        .populate('tags', 'name slug')
        .populate('author', 'firstName lastName');

      if (!resource) {
        throw new ApiError(404, 'Resource not found');
      }

      return resource;
    } catch (error) {
      logger.error('Resource retrieval failed:', error);
      throw error;
    }
  }

  async updateResource(id, data) {
    try {
      const resource = await Resource.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });

      if (!resource) {
        throw new ApiError(404, 'Resource not found');
      }

      return resource;
    } catch (error) {
      logger.error('Resource update failed:', error);
      throw error;
    }
  }

  /**
   * Comment operations
   */
  async addComment(articleId, userId, content) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new ApiError(404, 'Article not found');
      }

      article.comments.push({
        user: userId,
        content
      });

      await article.save();
      return article.comments[article.comments.length - 1];
    } catch (error) {
      logger.error('Comment addition failed:', error);
      throw error;
    }
  }

  async addReply(articleId, commentId, userId, content) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new ApiError(404, 'Article not found');
      }

      const comment = article.comments.id(commentId);
      if (!comment) {
        throw new ApiError(404, 'Comment not found');
      }

      comment.replies.push({
        user: userId,
        content
      });

      await article.save();
      return comment.replies[comment.replies.length - 1];
    } catch (error) {
      logger.error('Reply addition failed:', error);
      throw error;
    }
  }

  async moderateComment(articleId, commentId, status) {
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        throw new ApiError(404, 'Article not found');
      }

      const comment = article.comments.id(commentId);
      if (!comment) {
        throw new ApiError(404, 'Comment not found');
      }

      comment.status = status;
      await article.save();

      return comment;
    } catch (error) {
      logger.error('Comment moderation failed:', error);
      throw error;
    }
  }

  /**
   * Cache operations
   */
  async #clearCategoryCache() {
    await redis.del('categories:true');
    await redis.del('categories:false');
  }

  async #clearTagCache() {
    await redis.del('tags');
  }
}

export default new ContentService();
