import { validationResult } from 'express-validator';
import contentService from '../services/content.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class ContentController {
  /**
   * Create category
   * @route POST /api/v1/content/categories
   */
  createCategory = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const category = await contentService.createCategory(req.body);

    res.status(201).json({
      status: 'success',
      data: category
    });
  });

  /**
   * Get categories
   * @route GET /api/v1/content/categories
   */
  getCategories = catchAsync(async (req, res) => {
    const categories = await contentService.getCategories(
      req.query.includeInactive === 'true'
    );

    res.json({
      status: 'success',
      data: categories
    });
  });

  /**
   * Update category
   * @route PATCH /api/v1/content/categories/:id
   */
  updateCategory = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const category = await contentService.updateCategory(
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: category
    });
  });

  /**
   * Create tag
   * @route POST /api/v1/content/tags
   */
  createTag = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const tag = await contentService.createTag(req.body);

    res.status(201).json({
      status: 'success',
      data: tag
    });
  });

  /**
   * Get tags
   * @route GET /api/v1/content/tags
   */
  getTags = catchAsync(async (req, res) => {
    const tags = await contentService.getTags();

    res.json({
      status: 'success',
      data: tags
    });
  });

  /**
   * Update tag
   * @route PATCH /api/v1/content/tags/:id
   */
  updateTag = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const tag = await contentService.updateTag(
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: tag
    });
  });

  /**
   * Create article
   * @route POST /api/v1/content/articles
   */
  createArticle = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const article = await contentService.createArticle({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: article
    });
  });

  /**
   * Get articles
   * @route GET /api/v1/content/articles
   */
  getArticles = catchAsync(async (req, res) => {
    const result = await contentService.getArticles(
      {
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        author: req.query.author
      },
      {
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        sort: req.query.sort
      }
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get article
   * @route GET /api/v1/content/articles/:slug
   */
  getArticle = catchAsync(async (req, res) => {
    const article = await contentService.getArticle(req.params.slug);

    res.json({
      status: 'success',
      data: article
    });
  });

  /**
   * Update article
   * @route PATCH /api/v1/content/articles/:id
   */
  updateArticle = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const article = await contentService.updateArticle(
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: article
    });
  });

  /**
   * Create resource
   * @route POST /api/v1/content/resources
   */
  createResource = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const resource = await contentService.createResource({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({
      status: 'success',
      data: resource
    });
  });

  /**
   * Get resources
   * @route GET /api/v1/content/resources
   */
  getResources = catchAsync(async (req, res) => {
    const result = await contentService.getResources(
      {
        type: req.query.type,
        category: req.query.category,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        access: req.query.access
      },
      {
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        sort: req.query.sort
      }
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get resource
   * @route GET /api/v1/content/resources/:slug
   */
  getResource = catchAsync(async (req, res) => {
    const resource = await contentService.getResource(req.params.slug);

    res.json({
      status: 'success',
      data: resource
    });
  });

  /**
   * Update resource
   * @route PATCH /api/v1/content/resources/:id
   */
  updateResource = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const resource = await contentService.updateResource(
      req.params.id,
      req.body
    );

    res.json({
      status: 'success',
      data: resource
    });
  });

  /**
   * Add comment
   * @route POST /api/v1/content/articles/:id/comments
   */
  addComment = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const comment = await contentService.addComment(
      req.params.id,
      req.user.id,
      req.body.content
    );

    res.status(201).json({
      status: 'success',
      data: comment
    });
  });

  /**
   * Add reply
   * @route POST /api/v1/content/articles/:id/comments/:commentId/replies
   */
  addReply = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const reply = await contentService.addReply(
      req.params.id,
      req.params.commentId,
      req.user.id,
      req.body.content
    );

    res.status(201).json({
      status: 'success',
      data: reply
    });
  });

  /**
   * Moderate comment
   * @route PATCH /api/v1/content/articles/:id/comments/:commentId/moderate
   */
  moderateComment = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const comment = await contentService.moderateComment(
      req.params.id,
      req.params.commentId,
      req.body.status
    );

    res.json({
      status: 'success',
      data: comment
    });
  });
}

export default new ContentController();
