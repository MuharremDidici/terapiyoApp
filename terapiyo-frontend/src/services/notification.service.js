import api from './api';

class NotificationService {
  /**
   * Bildirimleri getir
   */
  async getNotifications(options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20,
        type: options.type || 'all'
      });

      const response = await api.get(`/notifications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Bildirim listesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread');
      return response.data;
    } catch (error) {
      console.error('Okunmamış bildirim sayısı getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
      throw error;
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
      throw error;
    }
  }

  /**
   * Bildirimi sil
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Bildirim silme hatası:', error);
      throw error;
    }
  }

  /**
   * Tüm bildirimleri sil
   */
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Tüm bildirimleri silme hatası:', error);
      throw error;
    }
  }

  /**
   * Bildirim ayarlarını getir
   */
  async getSettings() {
    try {
      const response = await api.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Bildirim ayarları getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Bildirim ayarlarını güncelle
   */
  async updateSettings(settings) {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Bildirim ayarları güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Push bildirim izni iste
   */
  async requestPushPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Push token'ı al ve sunucuya kaydet
        const token = await this.getPushToken();
        await this.registerPushToken(token);
      }
      return permission;
    } catch (error) {
      console.error('Push bildirim izni isteme hatası:', error);
      throw error;
    }
  }

  /**
   * Push token'ı sunucuya kaydet
   */
  async registerPushToken(token) {
    try {
      const response = await api.post('/notifications/push-token', { token });
      return response.data;
    } catch (error) {
      console.error('Push token kaydetme hatası:', error);
      throw error;
    }
  }

  /**
   * Push token'ı al
   */
  async getPushToken() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });
      return subscription;
    } catch (error) {
      console.error('Push token alma hatası:', error);
      throw error;
    }
  }
}

export default new NotificationService();
