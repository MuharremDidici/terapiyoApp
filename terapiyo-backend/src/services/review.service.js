import Review from '../models/review.model.js';
import Appointment from '../models/appointment.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';

class ReviewService {
  /**
   * Create review
   */
  async createReview(userId, appointmentId, data) {
    try {
      // Check if appointment exists and belongs to user
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        client: userId,
        status: 'completed'
      });

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found or not completed');
      }

      // Check if review already exists
      const existingReview = await Review.findOne({ appointment: appointmentId });
      if (existingReview) {
        throw new ApiError(400, 'Review already exists for this appointment');
      }

      // Create review
      const review = await Review.create({
        appointment: appointmentId,
        client: userId,
        therapist: appointment.therapist,
        rating: data.rating,
        comment: {
          text: data.comment,
          language: data.language || 'tr'
        },
        metadata: {
          platform: data.platform,
          device: data.device,
          sessionDuration: appointment.duration,
          sessionType: appointment.type
        }
      });

      return review;
    } catch (error) {
      logger.error('Review creation failed:', error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('client', 'firstName lastName avatar')
        .populate('therapist', 'firstName lastName title');

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      return review;
    } catch (error) {
      logger.error('Review retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Get therapist reviews
   */
  async getTherapistReviews(therapistId, filters = {}) {
    try {
      const {
        rating,
        status = 'approved',
        sortBy = 'createdAt',
        order = 'desc',
        page = 1,
        limit = 20
      } = filters;

      const query = { therapist: therapistId, status };
      if (rating) {
        query['rating.overall'] = rating;
      }

      const reviews = await Review.find(query)
        .populate('client', 'firstName lastName avatar')
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Review.countDocuments(query);

      return {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Review retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Get therapist statistics
   */
  async getTherapistStats(therapistId) {
    try {
      return await Review.getTherapistStats(therapistId);
    } catch (error) {
      logger.error('Stats retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Update review
   */
  async updateReview(reviewId, userId, data) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        client: userId
      });

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Only allow updates within 24 hours
      const hours = (Date.now() - review.createdAt) / (1000 * 60 * 60);
      if (hours > 24) {
        throw new ApiError(400, 'Review can only be updated within 24 hours');
      }

      Object.assign(review.rating, data.rating);
      review.comment.text = data.comment;
      review.status = 'pending';
      review.comment.moderated = false;

      await review.save();

      return review;
    } catch (error) {
      logger.error('Review update failed:', error);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        client: userId
      });

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Only allow deletion within 24 hours
      const hours = (Date.now() - review.createdAt) / (1000 * 60 * 60);
      if (hours > 24) {
        throw new ApiError(400, 'Review can only be deleted within 24 hours');
      }

      await review.deleteOne();

      return true;
    } catch (error) {
      logger.error('Review deletion failed:', error);
      throw error;
    }
  }

  /**
   * Moderate review
   */
  async moderateReview(reviewId, moderatorId, action, reason) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      switch (action) {
        case 'approve':
          await review.approve(moderatorId);
          break;
        case 'reject':
          await review.reject(moderatorId);
          break;
        case 'hide':
          await review.hide();
          break;
        default:
          throw new ApiError(400, 'Invalid moderation action');
      }

      return review;
    } catch (error) {
      logger.error('Review moderation failed:', error);
      throw error;
    }
  }

  /**
   * Flag review
   */
  async flagReview(reviewId, userId, reason, description) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      await review.addFlag(userId, reason, description);
      return review;
    } catch (error) {
      logger.error('Review flagging failed:', error);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      await review.markHelpful(userId);
      return review;
    } catch (error) {
      logger.error('Review marking as helpful failed:', error);
      throw error;
    }
  }

  /**
   * Reply to review
   */
  async replyToReview(reviewId, therapistId, text) {
    try {
      const review = await Review.findOne({
        _id: reviewId,
        therapist: therapistId
      });

      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      await review.addReply(text);
      return review;
    } catch (error) {
      logger.error('Review reply failed:', error);
      throw error;
    }
  }
}

export default new ReviewService();
