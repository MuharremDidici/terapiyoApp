import api from './api';

class MessageService {
  /**
   * Mesaj listesini getir
   */
  async getMessages(chatId, options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20
      });

      const response = await api.get(`/messages/${chatId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Mesaj listesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Sohbet listesini getir
   */
  async getChats(options = {}) {
    try {
      const params = new URLSearchParams({
        page: options.page || 1,
        limit: options.limit || 20
      });

      const response = await api.get(`/chats?${params}`);
      return response.data;
    } catch (error) {
      console.error('Sohbet listesi getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Mesaj gönder
   */
  async sendMessage(chatId, message) {
    try {
      const response = await api.post(`/messages/${chatId}`, message);
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Dosya gönder
   */
  async sendFile(chatId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/messages/${chatId}/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Dosya gönderme hatası:', error);
      throw error;
    }
  }

  /**
   * Mesajı işaretle
   */
  async markMessage(messageId, action) {
    try {
      const response = await api.put(`/messages/${messageId}/mark`, { action });
      return response.data;
    } catch (error) {
      console.error('Mesaj işaretleme hatası:', error);
      throw error;
    }
  }

  /**
   * Mesajı sil
   */
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      throw error;
    }
  }

  /**
   * Sohbeti arşivle
   */
  async archiveChat(chatId) {
    try {
      const response = await api.put(`/chats/${chatId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Sohbet arşivleme hatası:', error);
      throw error;
    }
  }

  /**
   * Sohbeti sil
   */
  async deleteChat(chatId) {
    try {
      const response = await api.delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Sohbet silme hatası:', error);
      throw error;
    }
  }

  /**
   * Okunmamış mesaj sayısını getir
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/messages/unread');
      return response.data;
    } catch (error) {
      console.error('Okunmamış mesaj sayısı getirme hatası:', error);
      throw error;
    }
  }

  /**
   * Mesajları okundu olarak işaretle
   */
  async markAsRead(chatId) {
    try {
      const response = await api.put(`/messages/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mesajları okundu işaretleme hatası:', error);
      throw error;
    }
  }
}

export default new MessageService();
