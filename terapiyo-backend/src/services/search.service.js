import { SearchHistory, PopularSearch, TherapistIndex } from '../models/search.model.js';
import User from '../models/user.model.js';
import { redis } from '../config/database.js';
import logger from '../config/logger.js';
import elasticSearchService from './search.elastic.service.js';

class SearchService {
  /**
   * Search therapists
   */
  async searchTherapists(userId, query, filters = {}, options = {}) {
    try {
      // Elasticsearch ile arama yap
      const searchResult = await elasticSearchService.searchTherapists(
        query,
        filters,
        options
      );

      // Arama geçmişini kaydet
      if (userId) {
        await SearchHistory.create({
          user: userId,
          query: {
            text: query,
            filters
          },
          results: {
            total: searchResult.pagination.total,
            therapists: searchResult.therapists.map(t => t._id)
          },
          metadata: options.metadata
        });
      }

      // Popüler aramaları güncelle
      if (query) {
        await PopularSearch.incrementSearch(query, this.categorizeSearch(query));
      }

      return searchResult;
    } catch (error) {
      logger.error('Terapist arama hatası:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(prefix, type = 'all') {
    try {
      return await elasticSearchService.getSuggestions(prefix, type);
    } catch (error) {
      logger.error('Öneri alma hatası:', error);
      throw error;
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(category) {
    try {
      const cacheKey = `popular_searches:${category || 'all'}`;
      let searches = await redis.get(cacheKey);

      if (!searches) {
        searches = await PopularSearch.getTopSearches(category);
        await redis.set(cacheKey, JSON.stringify(searches), 'EX', 3600);
      } else {
        searches = JSON.parse(searches);
      }

      return searches;
    } catch (error) {
      logger.error('Popüler arama hatası:', error);
      throw error;
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(userId) {
    try {
      return await SearchHistory.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('results.therapists', 'name avatar');
    } catch (error) {
      logger.error('Arama geçmişi alma hatası:', error);
      throw error;
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(userId) {
    try {
      await SearchHistory.deleteMany({ user: userId });
    } catch (error) {
      logger.error('Arama geçmişi temizleme hatası:', error);
      throw error;
    }
  }

  /**
   * Categorize search query
   */
  categorizeSearch(query) {
    // Kategori belirleme mantığı
    const specialtyKeywords = ['terapi', 'psikoloji', 'danışmanlık'];
    const problemKeywords = ['depresyon', 'anksiyete', 'stres'];
    const locationKeywords = ['istanbul', 'ankara', 'izmir'];

    const lowerQuery = query.toLowerCase();

    if (specialtyKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'specialty';
    }
    if (problemKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'problem';
    }
    if (locationKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'location';
    }
    return 'other';
  }

  /**
   * Index management
   */
  async reindexAll() {
    try {
      const therapists = await User.find({ role: 'therapist' });
      for (const therapist of therapists) {
        await elasticSearchService.indexTherapist(therapist);
      }
      logger.info('Tüm terapistler yeniden indekslendi');
    } catch (error) {
      logger.error('Yeniden indeksleme hatası:', error);
      throw error;
    }
  }
}

export default new SearchService();
