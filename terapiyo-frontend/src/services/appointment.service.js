import api from './api';

class AppointmentService {
  /**
   * Randevu oluştur
   */
  async createAppointment(data) {
    try {
      const response = await api.post('/appointments', data);
      return response.data;
    } catch (error) {
      console.error('Randevu oluşturma hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu detaylarını getir
   */
  async getAppointmentDetails(appointmentId) {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Randevu detayları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevuları listele
   */
  async listAppointments(filters = {}) {
    try {
      const params = new URLSearchParams({
        status: filters.status,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        page: filters.page || 1,
        limit: filters.limit || 10
      });

      const response = await api.get(`/appointments?${params}`);
      return response.data;
    } catch (error) {
      console.error('Randevu listesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu güncelle
   */
  async updateAppointment(appointmentId, data) {
    try {
      const response = await api.put(`/appointments/${appointmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Randevu güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu iptal et
   */
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await api.post(`/appointments/${appointmentId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Randevu iptal hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu notları ekle/güncelle
   */
  async updateAppointmentNotes(appointmentId, notes) {
    try {
      const response = await api.put(`/appointments/${appointmentId}/notes`, {
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Randevu notları güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu ödemesi yap
   */
  async processPayment(appointmentId, paymentData) {
    try {
      const response = await api.post(
        `/appointments/${appointmentId}/payment`,
        paymentData
      );
      return response.data;
    } catch (error) {
      console.error('Randevu ödeme hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu hatırlatıcısı ayarla
   */
  async setReminder(appointmentId, reminderData) {
    try {
      const response = await api.post(
        `/appointments/${appointmentId}/reminder`,
        reminderData
      );
      return response.data;
    } catch (error) {
      console.error('Randevu hatırlatıcı ayarlama hatası:', error);
      throw error;
    }
  }

  /**
   * Randevu geri bildirimi gönder
   */
  async submitFeedback(appointmentId, feedback) {
    try {
      const response = await api.post(
        `/appointments/${appointmentId}/feedback`,
        feedback
      );
      return response.data;
    } catch (error) {
      console.error('Randevu geri bildirim hatası:', error);
      throw error;
    }
  }
}

export default new AppointmentService();
