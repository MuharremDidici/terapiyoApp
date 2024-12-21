import api from './api';
import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
  }

  // Socket bağlantısını başlat
  initSocket() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });
    }
    return this.socket;
  }

  // Socket bağlantısını kapat
  closeSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Sohbet listesini getir
  async getChats() {
    try {
      const response = await api.get('/chats');
      return response.data;
    } catch (error) {
      console.error('Sohbet listesi getirme hatası:', error);
      throw error;
    }
  }

  // Belirli bir sohbetin mesajlarını getir
  async getChatMessages(chatId, page = 1, limit = 50) {
    try {
      const response = await api.get(
        `/chats/${chatId}/messages?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Mesaj getirme hatası:', error);
      throw error;
    }
  }

  // Yeni sohbet başlat
  async createChat(recipientId) {
    try {
      const response = await api.post('/chats', { recipientId });
      return response.data;
    } catch (error) {
      console.error('Sohbet oluşturma hatası:', error);
      throw error;
    }
  }

  // Mesaj gönder
  async sendMessage(chatId, content, attachments = []) {
    try {
      const formData = new FormData();
      formData.append('content', content);
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await api.post(
        `/chats/${chatId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      throw error;
    }
  }

  // Mesajı işaretle
  async markMessage(messageId, action) {
    try {
      const response = await api.put(`/messages/${messageId}/${action}`);
      return response.data;
    } catch (error) {
      console.error('Mesaj işaretleme hatası:', error);
      throw error;
    }
  }

  // Mesajı sil
  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Mesaj silme hatası:', error);
      throw error;
    }
  }

  // Sohbeti arşivle
  async archiveChat(chatId) {
    try {
      const response = await api.put(`/chats/${chatId}/archive`);
      return response.data;
    } catch (error) {
      console.error('Sohbet arşivleme hatası:', error);
      throw error;
    }
  }

  // Sohbeti sil
  async deleteChat(chatId) {
    try {
      const response = await api.delete(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Sohbet silme hatası:', error);
      throw error;
    }
  }

  // Sohbeti oku olarak işaretle
  async markChatAsRead(chatId) {
    try {
      const response = await api.put(`/chats/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error('Sohbet okuma hatası:', error);
      throw error;
    }
  }

  // Dosya yükle
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    }
  }

  // Yazıyor durumunu gönder
  sendTypingStatus(chatId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Çevrimiçi durumunu güncelle
  updateOnlineStatus(status) {
    if (this.socket) {
      this.socket.emit('status', { status });
    }
  }
}

export default new ChatService();
