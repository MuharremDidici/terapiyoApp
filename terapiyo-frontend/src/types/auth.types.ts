// Temel API yanıt tipi
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Auth yanıt tipi
export interface AuthResponse extends ApiResponse {
  data: {
    user: User;
    accessToken: string;
  };
}

// API hata tipi
export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

// Kullanıcı rolleri
export enum UserRole {
  USER = 'user',
  THERAPIST = 'therapist',
  ADMIN = 'admin'
}

// Kullanıcı durumu
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked'
}

// Backend'den gelen kullanıcı tipi
export interface BackendUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
  avatar?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  isVerified: boolean;
  sessionCount: number;
  createdAt: string;
}

// Frontend'de kullanılan kullanıcı tipi
export interface User extends Omit<BackendUser, 'createdAt'> {
  fullName?: string;
}

// Profil yanıt tipi
export interface ProfileResponse extends ApiResponse<User> {}

// Auth state tipi
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Form veri tipleri
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role?: UserRole;
  termsAccepted: boolean;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string | File;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Şifre işlemleri
export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
