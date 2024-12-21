import api from './api';

class AnalyticsService {
  // Platform genel bakış raporu
  async getPlatformOverview(period) {
    try {
      const response = await api.get('/analytics/platform-overview', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Platform genel bakış raporu hatası:', error);
      throw error;
    }
  }

  // Terapist performans raporu
  async getTherapistPerformance(therapistId, period) {
    try {
      const response = await api.get(
        `/analytics/therapist-performance/${therapistId}`,
        { params: { period } }
      );
      return response.data;
    } catch (error) {
      console.error('Terapist performans raporu hatası:', error);
      throw error;
    }
  }

  // Finansal rapor
  async getFinancialReport(period) {
    try {
      const response = await api.get('/analytics/financial-report', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Finansal rapor hatası:', error);
      throw error;
    }
  }

  // Özel metrik ekleme
  async addMetric(metricData) {
    try {
      const response = await api.post('/analytics/metrics', metricData);
      return response.data;
    } catch (error) {
      console.error('Metrik ekleme hatası:', error);
      throw error;
    }
  }

  // Olay kaydetme
  async logEvent(eventData) {
    try {
      const response = await api.post('/analytics/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Olay kaydetme hatası:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
