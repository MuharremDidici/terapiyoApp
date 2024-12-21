import api from './api';
import { 
  AuthResponse, 
  ApiResponse, 
  User, 
  LoginFormData,
  RegisterFormData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData
} from '@/types/auth.types';

class AuthService {
  async login(formData: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', formData);
      console.log('Auth Service Login Response:', response);
      
      if (!response.data || !response.data.status || !response.data.data) {
        throw new Error('Invalid response format');
      }

      const { user, accessToken } = response.data.data;
      
      // Token ve kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  async register(formData: RegisterFormData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', formData);
      const { data } = response;

      if (data.success && data.data) {
        const { tokens, user } = data.data;
        localStorage.setItem('token', tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
      }

      return data;
    } catch (error: any) {
      console.error('Register error:', error);
      throw this.handleError(error);
    }
  }

  async forgotPassword(formData: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', formData);
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw this.handleError(error);
    }
  }

  async resetPassword(formData: ResetPasswordData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/reset-password', formData);
      const { data } = response;

      if (data.success && data.data) {
        const { tokens, user } = data.data;
        localStorage.setItem('token', tokens.accessToken);
        if (tokens.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(user));
      }

      return data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw this.handleError(error);
    }
  }

  async changePassword(formData: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>('/auth/change-password', formData);
      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error);
      throw this.handleError(error);
    }
  }

  async updateProfile(formData: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/profile', formData);
      const { data } = response;

      if (data.success && data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      return data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw this.handleError(error);
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return error;
  }
}

export default new AuthService();
