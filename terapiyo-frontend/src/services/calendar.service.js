import api from './api';

class CalendarService {
  /**
   * Etkinlikleri getir
   */
  async getEvents(start, end, options = {}) {
    try {
      const params = new URLSearchParams({
        start,
        end,
        type: options.type || 'all'
      });

      const response = await api.get(`/calendar/events?${params}`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik listesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Etkinlik detaylarını getir
   */
  async getEvent(eventId) {
    try {
      const response = await api.get(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik detayları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Etkinlik oluştur
   */
  async createEvent(eventData) {
    try {
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Etkinlik güncelle
   */
  async updateEvent(eventId, eventData) {
    try {
      const response = await api.put(`/calendar/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Etkinlik güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Etkinlik sil
   */
  async deleteEvent(eventId) {
    try {
      const response = await api.delete(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Etkinlik silme hatası:', error);
      throw error;
    }
  }

  /**
   * Google Calendar senkronizasyonu
   */
  async syncGoogleCalendar() {
    try {
      const response = await api.post('/calendar/sync/google');
      return response.data;
    } catch (error) {
      console.error('Google Calendar senkronizasyon hatası:', error);
      throw error;
    }
  }

  /**
   * iCalendar dosyası indir
   */
  async exportICalendar(eventId) {
    try {
      const response = await api.get(`/calendar/events/${eventId}/ical`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('iCalendar indirme hatası:', error);
      throw error;
    }
  }

  /**
   * Müsait zamanları getir
   */
  async getAvailableSlots(therapistId, date) {
    try {
      const params = new URLSearchParams({
        therapistId,
        date
      });

      const response = await api.get(`/calendar/slots?${params}`);
      return response.data;
    } catch (error) {
      console.error('Müsait zaman getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Çakışan randevuları kontrol et
   */
  async checkConflicts(eventData) {
    try {
      const response = await api.post('/calendar/check-conflicts', eventData);
      return response.data;
    } catch (error) {
      console.error('Çakışma kontrolü hatası:', error);
      throw error;
    }
  }

  /**
   * Takvim ayarlarını getir
   */
  async getSettings() {
    try {
      const response = await api.get('/calendar/settings');
      return response.data;
    } catch (error) {
      console.error('Takvim ayarları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Takvim ayarlarını güncelle
   */
  async updateSettings(settings) {
    try {
      const response = await api.put('/calendar/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Takvim ayarları güncelleme hatası:', error);
      throw error;
    }
  }
}

export default new CalendarService();
