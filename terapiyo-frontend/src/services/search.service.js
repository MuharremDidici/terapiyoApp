import api from './api';

class SearchService {
  /**
   * Terapist arama
   */
  async searchTherapists(query, filters = {}, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        filters: JSON.stringify(filters),
        page: options.page || 1,
        limit: options.limit || 20,
        sort: options.sort || 'relevance',
        lat: options.location?.lat,
        lon: options.location?.lon,
        city: options.location?.city,
        country: options.location?.country
      });

      const response = await api.get(`/search/therapists?${params}`);
      return response.data;
    } catch (error) {
      console.error('Terapist arama hatası:', error);
      throw error;
    }
  }

  /**
   * İçerik arama
   */
  async searchContent(query, filters = {}, options = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        filters: JSON.stringify(filters),
        page: options.page || 1,
        limit: options.limit || 20,
        sort: options.sort || 'relevance'
      });

      const response = await api.get(`/search/content?${params}`);
      return response.data;
    } catch (error) {
      console.error('İçerik arama hatası:', error);
      throw error;
    }
  }

  /**
   * Arama önerileri
   */
  async getSearchSuggestions(query, type = 'all') {
    try {
      const response = await api.get('/search/suggestions', {
        params: { q: query, type }
      });
      return response.data;
    } catch (error) {
      console.error('Öneri alma hatası:', error);
      throw error;
    }
  }

  /**
   * Popüler aramalar
   */
  async getPopularSearches(category) {
    try {
      const response = await api.get('/search/popular', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Popüler arama hatası:', error);
      throw error;
    }
  }

  /**
   * Arama geçmişi
   */
  async getSearchHistory() {
    try {
      const response = await api.get('/search/history');
      return response.data;
    } catch (error) {
      console.error('Arama geçmişi hatası:', error);
      throw error;
    }
  }

  /**
   * Arama geçmişini temizle
   */
  async clearSearchHistory() {
    try {
      const response = await api.delete('/search/history');
      return response.data;
    } catch (error) {
      console.error('Arama geçmişi temizleme hatası:', error);
      throw error;
    }
  }
}

export default new SearchService();
