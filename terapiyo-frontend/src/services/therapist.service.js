import api from './api';

class TherapistService {
  /**
   * Terapist detaylarını getir
   */
  async getTherapistDetails(therapistId) {
    try {
      const response = await api.get(`/therapists/${therapistId}`);
      return response.data;
    } catch (error) {
      console.error('Terapist detayları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist değerlendirmelerini getir
   */
  async getTherapistReviews(therapistId, options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 10,
        sort: options.sort || '-createdAt'
      });

      const response = await api.get(`/therapists/${therapistId}/reviews?${params}`);
      return response.data;
    } catch (error) {
      console.error('Terapist değerlendirmeleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist müsaitlik durumunu getir
   */
  async getTherapistAvailability(therapistId, startDate, endDate) {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await api.get(`/therapists/${therapistId}/availability?${params}`);
      return response.data;
    } catch (error) {
      console.error('Terapist müsaitlik durumu getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist seans tiplerini getir
   */
  async getTherapistSessionTypes(therapistId) {
    try {
      const response = await api.get(`/therapists/${therapistId}/session-types`);
      return response.data;
    } catch (error) {
      console.error('Terapist seans tipleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapisti favorilere ekle/çıkar
   */
  async toggleFavorite(therapistId) {
    try {
      const response = await api.post(`/therapists/${therapistId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Terapist favori işlemi hatası:', error);
      throw error;
    }
  }

  /**
   * Terapiste mesaj gönder
   */
  async sendMessage(therapistId, message) {
    try {
      const response = await api.post(`/therapists/${therapistId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Terapiste mesaj gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist değerlendirmesi yap
   */
  async createReview(therapistId, review) {
    try {
      const response = await api.post(`/therapists/${therapistId}/reviews`, review);
      return response.data;
    } catch (error) {
      console.error('Terapist değerlendirme hatası:', error);
      throw error;
    }
  }

  /**
   * Terapist randevusu oluştur
   */
  async createAppointment(therapistId, appointment) {
    try {
      const response = await api.post(`/therapists/${therapistId}/appointments`, appointment);
      return response.data;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  }
}

export default new TherapistService();
