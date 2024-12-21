import { redis } from '../config/database.js';
import Therapist from '../models/therapist.model.js';
import User from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class TherapistService {
  /**
   * Create therapist profile
   */
  async createProfile(userId, profileData) {
    try {
      // Check if user exists and is not already a therapist
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.role === 'therapist') {
        throw new ApiError(400, 'Therapist profile already exists');
      }

      // Create therapist profile
      const therapist = await Therapist.create({
        user: userId,
        ...profileData
      });

      // Update user role
      user.role = 'therapist';
      await user.save();

      return therapist;
    } catch (error) {
      logger.error('Error creating therapist profile:', error);
      throw error;
    }
  }

  /**
   * Update therapist profile
   */
  async updateProfile(therapistId, userId, updateData) {
    try {
      const therapist = await Therapist.findOne({
        _id: therapistId,
        user: userId
      });

      if (!therapist) {
        throw new ApiError(404, 'Therapist profile not found');
      }

      // Update profile
      Object.assign(therapist, updateData);
      await therapist.save();

      // Clear cache
      await redis.del(`therapist:${therapistId}`);

      return therapist;
    } catch (error) {
      logger.error('Error updating therapist profile:', error);
      throw error;
    }
  }

  /**
   * Get therapist profile
   */
  async getProfile(therapistId) {
    try {
      // Try to get from cache
      const cachedTherapist = await redis.get(`therapist:${therapistId}`);
      if (cachedTherapist) {
        return JSON.parse(cachedTherapist);
      }

      // Get from database
      const therapist = await Therapist.findById(therapistId)
        .populate('user', 'firstName lastName email profileImage')
        .populate('reviews')
        .lean();

      if (!therapist) {
        throw new ApiError(404, 'Therapist not found');
      }

      // Cache the result
      await redis.set(
        `therapist:${therapistId}`,
        JSON.stringify(therapist),
        'EX',
        3600 // 1 hour
      );

      return therapist;
    } catch (error) {
      logger.error('Error getting therapist profile:', error);
      throw error;
    }
  }

  /**
   * Search therapists
   */
  async searchTherapists(filters) {
    try {
      const {
        specialties,
        languages,
        sessionTypes,
        minRating,
        maxPrice,
        availability,
        page = 1,
        limit = 10
      } = filters;

      const query = { status: 'active' };

      // Apply filters
      if (specialties?.length) {
        query.specialties = { $in: specialties };
      }

      if (languages?.length) {
        query.languages = { $in: languages };
      }

      if (sessionTypes?.length) {
        query['sessionTypes.type'] = { $in: sessionTypes };
      }

      if (minRating) {
        query['rating.average'] = { $gte: parseFloat(minRating) };
      }

      if (maxPrice) {
        query['sessionTypes.price'] = { $lte: parseFloat(maxPrice) };
      }

      if (availability) {
        query['availability.schedule.day'] = availability.day;
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const therapists = await Therapist.find(query)
        .populate('user', 'firstName lastName email profileImage')
        .sort({ 'rating.average': -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Therapist.countDocuments(query);

      return {
        therapists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error searching therapists:', error);
      throw error;
    }
  }

  /**
   * Update availability
   */
  async updateAvailability(therapistId, userId, availability) {
    try {
      const therapist = await Therapist.findOne({
        _id: therapistId,
        user: userId
      });

      if (!therapist) {
        throw new ApiError(404, 'Therapist profile not found');
      }

      therapist.availability = availability;
      await therapist.save();

      // Clear cache
      await redis.del(`therapist:${therapistId}`);

      return therapist;
    } catch (error) {
      logger.error('Error updating availability:', error);
      throw error;
    }
  }

  /**
   * Upload verification document
   */
  async uploadDocument(therapistId, userId, document) {
    try {
      const therapist = await Therapist.findOne({
        _id: therapistId,
        user: userId
      });

      if (!therapist) {
        throw new ApiError(404, 'Therapist profile not found');
      }

      therapist.verificationDocuments.push(document);
      await therapist.save();

      return therapist;
    } catch (error) {
      logger.error('Error uploading document:', error);
      throw error;
    }
  }
}

export default new TherapistService();
