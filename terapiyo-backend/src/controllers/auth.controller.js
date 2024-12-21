import { validationResult } from 'express-validator';
import authService from '../services/auth.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';
import logger from '../config/logger.js';

class AuthController {
  /**
   * Register new user
   * @route POST /api/v1/auth/register
   */
  register = catchAsync(async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, 'Validation error', errors.array());
      }

      const { firstName, lastName, email, phone, password } = req.body;
      
      const result = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password
      });
      
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken
        }
      });
    } catch (error) {
      logger.error('Register error:', error);
      
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
          errors: error.errors
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Kayıt işlemi sırasında bir hata oluştu'
      });
    }
  });

  /**
   * Login user
   * @route POST /api/v1/auth/login
   */
  login = catchAsync(async (req, res) => {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      const userWithDefaults = {
        _id: result.user._id,
        firstName: result.user.firstName || '',
        lastName: result.user.lastName || '',
        email: result.user.email || '',
        phone: result.user.phone || '',
        avatar: result.user.avatar || '',
        notificationSettings: result.user.notificationSettings || {
          email: true,
          push: true,
          sms: true
        },
        isVerified: result.user.isVerified || false,
        sessionCount: result.user.sessionCount || 0,
        createdAt: result.user.createdAt
      };

      res.status(200).json({
        status: 'success',
        data: {
          user: userWithDefaults,
          accessToken: result.tokens.accessToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Giriş işlemi sırasında bir hata oluştu'
      });
    }
  });

  /**
   * Logout user
   * @route POST /api/v1/auth/logout
   */
  logout = catchAsync(async (req, res) => {
    try {
      await authService.logout(req.user.id);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        status: 'success',
        message: 'Başarıyla çıkış yapıldı'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      
      res.status(500).json({
        status: 'error',
        message: 'Çıkış işlemi sırasında bir hata oluştu'
      });
    }
  });

  /**
   * Refresh access token
   * @route POST /api/v1/auth/refresh-token
   */
  refreshToken = catchAsync(async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new ApiError(401, 'Yenileme tokeni bulunamadı');
      }

      const tokens = await authService.refreshToken(refreshToken);

      // Set new refresh token in cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        status: 'success',
        data: {
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
      }
      
      res.status(500).json({
        status: 'error',
        message: 'Token yenileme işlemi sırasında bir hata oluştu'
      });
    }
  });
}

export default new AuthController();
