import { validationResult } from 'express-validator';
import searchService from '../services/search.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class SearchController {
  /**
   * Search therapists
   * @route GET /api/v1/search/therapists
   */
  searchTherapists = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const result = await searchService.searchTherapists(
      req.user?.id,
      req.query.q,
      req.query.filters ? JSON.parse(req.query.filters) : {},
      {
        page: parseInt(req.query.page),
        limit: parseInt(req.query.limit),
        sort: req.query.sort,
        metadata: {
          platform: req.headers['user-agent'],
          device: req.device.type,
          location: {
            lat: parseFloat(req.query.lat),
            lon: parseFloat(req.query.lon),
            city: req.query.city,
            country: req.query.country
          }
        }
      }
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Search content
   * @route GET /api/v1/search/content
   */
  searchContent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Doğrulama hatası', errors.array());
    }

    const result = await searchService.searchContent(
      req.query.q,
      req.query.filters ? JSON.parse(req.query.filters) : {},
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
   * Get search suggestions
   * @route GET /api/v1/search/suggestions
   */
  getSearchSuggestions = catchAsync(async (req, res) => {
    const suggestions = await searchService.getSearchSuggestions(
      req.query.q,
      req.query.type
    );

    res.json({
      status: 'success',
      data: suggestions
    });
  });

  /**
   * Get popular searches
   * @route GET /api/v1/search/popular
   */
  getPopularSearches = catchAsync(async (req, res) => {
    const searches = await searchService.getPopularSearches(
      req.query.category
    );

    res.json({
      status: 'success',
      data: searches
    });
  });

  /**
   * Get search history
   * @route GET /api/v1/search/history
   */
  getSearchHistory = catchAsync(async (req, res) => {
    const history = await searchService.getSearchHistory(req.user.id);

    res.json({
      status: 'success',
      data: history
    });
  });

  /**
   * Clear search history
   * @route DELETE /api/v1/search/history
   */
  clearSearchHistory = catchAsync(async (req, res) => {
    await searchService.clearSearchHistory(req.user.id);

    res.json({
      status: 'success',
      message: 'Arama geçmişi temizlendi'
    });
  });

  /**
   * Reindex all
   * @route POST /api/v1/search/reindex
   */
  reindexAll = catchAsync(async (req, res) => {
    await searchService.reindexAll();

    res.json({
      status: 'success',
      message: 'Tüm veriler yeniden indekslendi'
    });
  });
}

export default new SearchController();
