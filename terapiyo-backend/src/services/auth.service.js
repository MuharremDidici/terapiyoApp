import jwt from 'jsonwebtoken';
import { redis } from '../config/database.js';
import User from '../models/user.model.js';
import logger from '../config/logger.js';
import { ApiError } from '../utils/api-error.js';

class AuthService {
  /**
   * Generate JWT tokens
   */
  async generateTokens(userId) {
    try {
      const accessToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Redis'e refresh token'ı kaydet
      await redis.set(
        `refresh_token:${userId}`,
        refreshToken,
        'EX',
        7 * 24 * 60 * 60 // 7 gün
      );

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Token generation error:', error);
      throw new ApiError(500, 'Error generating authentication tokens');
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ApiError(400, 'Bu email adresi zaten kayıtlı');
      }

      // Create user
      const user = await User.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role
      });
      logger.info('User created:', { userId: user._id });

      // Generate tokens
      const tokens = await this.generateTokens(user._id);

      return {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        tokens
      };
    } catch (error) {
      logger.error('Register error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Kayıt işlemi sırasında bir hata oluştu');
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      logger.info('Login attempt:', { email });

      // Find user and select password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.warn('User not found:', { email });
        throw new ApiError(401, 'Geçersiz email veya şifre');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        logger.warn('Invalid password:', { email });
        throw new ApiError(401, 'Geçersiz email veya şifre');
      }

      // Update last login
      user.lastLogin = new Date();
      user.sessionCount += 1;
      await user.save({ validateBeforeSave: false });

      // Generate tokens
      const tokens = await this.generateTokens(user._id);

      // Remove password from response
      user.password = undefined;

      // Add default values
      const userWithDefaults = {
        _id: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        notificationSettings: user.notificationSettings || {
          email: true,
          push: true,
          sms: true
        },
        isVerified: user.isVerified || false,
        sessionCount: user.sessionCount || 0,
        createdAt: user.createdAt,
        role: user.role || 'user'
      };

      logger.info('Login successful:', { userId: user._id });

      return {
        user: userWithDefaults,
        tokens
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Giriş işlemi sırasında bir hata oluştu');
    }
  }

  /**
   * Logout user
   */
  async logout(userId) {
    try {
      // Redis'ten refresh token'ı sil
      await redis.del(`refresh_token:${userId}`);
      logger.info('User logged out:', { userId });
      return true;
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.userId);

      logger.info('Token refreshed:', { userId: decoded.userId });

      return tokens;
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new ApiError(401, 'Invalid refresh token');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      // Find user with verification token
      const user = await User.findOne({
        verificationToken: crypto
          .createHash('sha256')
          .update(token)
          .digest('hex'),
        verificationTokenExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new ApiError(400, 'Invalid or expired verification token');
      }

      // Update user
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save();

      return true;
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }
}

export default new AuthService();
