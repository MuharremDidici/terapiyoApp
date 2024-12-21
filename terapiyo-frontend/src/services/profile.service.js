import api from './api';

class ProfileService {
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      console.log('Get profile response:', response.data);
      
      if (!response.data || !response.data.status || !response.data.user) {
        throw new Error('Invalid response format');
      }

      // Local storage'ı güncelle
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const response = await api.patch('/users/profile', data);
      console.log('Update profile response:', response.data);
      
      if (!response.data || !response.data.status || !response.data.user) {
        throw new Error('Invalid response format');
      }

      // Local storage'ı güncelle
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async updateAvatar(formData) {
    try {
      const response = await api.patch('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Avatar update response:', response.data);

      if (!response.data || !response.data.status || !response.data.user) {
        throw new Error('Invalid response format');
      }

      // Local storage'ı güncelle
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Avatar update error:', error);
      throw error;
    }
  }

  async changePassword(data) {
    try {
      const response = await api.patch('/users/profile/password', data);
      console.log('Change password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error('Şifre değiştirilirken bir hata oluştu');
    }
  }
}

export default new ProfileService();
