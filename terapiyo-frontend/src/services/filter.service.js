import api from './api';

class FilterService {
  /**
   * Terapistleri filtrele
   */
  async filterTherapists(filters) {
    try {
      const response = await api.post('/therapists/filter', filters);
      return response.data;
    } catch (error) {
      console.error('Terapist filtreleme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevuları filtrele
   */
  async filterAppointments(filters) {
    try {
      const response = await api.post('/appointments/filter', filters);
      return response.data;
    } catch (error) {
      console.error('Randevu filtreleme hatası:', error);
      throw error;
    }
  }

  /**
   * Ödemeleri filtrele
   */
  async filterPayments(filters) {
    try {
      const response = await api.post('/payments/filter', filters);
      return response.data;
    } catch (error) {
      console.error('Ödeme filtreleme hatası:', error);
      throw error;
    }
  }

  /**
   * Mesajları filtrele
   */
  async filterMessages(filters) {
    try {
      const response = await api.post('/messages/filter', filters);
      return response.data;
    } catch (error) {
      console.error('Mesaj filtreleme hatası:', error);
      throw error;
    }
  }

  /**
   * Bildirimleri filtrele
   */
  async filterNotifications(filters) {
    try {
      const response = await api.post('/notifications/filter', filters);
      return response.data;
    } catch (error) {
      console.error('Bildirim filtreleme hatası:', error);
      throw error;
    }
  }

  /**
   * Filtre seçeneklerini getir
   */
  async getFilterOptions(type) {
    try {
      const response = await api.get(`/filters/${type}`);
      return response.data;
    } catch (error) {
      console.error('Filtre seçenekleri getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Kayıtlı filtreleri getir
   */
  async getSavedFilters(type) {
    try {
      const response = await api.get(`/filters/saved/${type}`);
      return response.data;
    } catch (error) {
      console.error('Kayıtlı filtre getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Filtreyi kaydet
   */
  async saveFilter(name, type, filters) {
    try {
      const response = await api.post('/filters/save', {
        name,
        type,
        filters
      });
      return response.data;
    } catch (error) {
      console.error('Filtre kaydetme hatası:', error);
      throw error;
    }
  }

  /**
   * Kayıtlı filtreyi sil
   */
  async deleteFilter(filterId) {
    try {
      const response = await api.delete(`/filters/saved/${filterId}`);
      return response.data;
    } catch (error) {
      console.error('Filtre silme hatası:', error);
      throw error;
    }
  }
}

export default new FilterService();
