import {
  UserPreference,
  Recommendation,
  ContentSimilarity,
  UserSimilarity,
  Feedback
} from '../models/recommendation.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { redis } from '../config/database.js';
import { computeContentSimilarity } from '../utils/ml/content-similarity.js';
import { computeUserSimilarity } from '../utils/ml/user-similarity.js';
import { rankTherapists } from '../utils/ml/ranking.js';
import { extractFeatures } from '../utils/ml/feature-extraction.js';

class RecommendationService {
  /**
   * User Preferences
   */
  async updateUserPreferences(userId, preferences) {
    try {
      let userPref = await UserPreference.findOne({ user: userId });
      
      if (!userPref) {
        userPref = new UserPreference({
          user: userId,
          ...preferences
        });
      } else {
        Object.assign(userPref, preferences);
      }

      await userPref.save();

      // Invalidate cached recommendations
      await redis.del(`recommendations:${userId}`);

      return userPref;
    } catch (error) {
      logger.error('User preferences update failed:', error);
      throw error;
    }
  }

  async getUserPreferences(userId) {
    try {
      const preferences = await UserPreference.findOne({ user: userId })
        .populate('sessionHistory.therapist', 'firstName lastName avatar specialties');

      if (!preferences) {
        throw new ApiError(404, 'User preferences not found');
      }

      return preferences;
    } catch (error) {
      logger.error('User preferences retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Recommendations Generation
   */
  async generateRecommendations(userId, filters = {}) {
    try {
      // Check cache first
      const cachedRecommendations = await redis.get(`recommendations:${userId}`);
      if (cachedRecommendations && !filters.force) {
        return JSON.parse(cachedRecommendations);
      }

      // Create recommendation record
      const recommendation = await Recommendation.create({
        user: userId,
        filters,
        status: 'processing'
      });

      // Get user preferences
      const userPreferences = await UserPreference.findOne({ user: userId });
      if (!userPreferences) {
        throw new ApiError(404, 'User preferences not found');
      }

      // Get candidate therapists
      const candidates = await this.#getCandidateTherapists(filters);

      // Generate recommendations using different algorithms
      const [contentBasedScores, collaborativeScores] = await Promise.all([
        this.#generateContentBasedScores(userPreferences, candidates),
        this.#generateCollaborativeScores(userId, candidates)
      ]);

      // Combine scores and rank therapists
      const rankedTherapists = await rankTherapists(
        candidates,
        contentBasedScores,
        collaborativeScores,
        filters
      );

      // Update recommendation record
      recommendation.recommendations = rankedTherapists.map(therapist => ({
        therapist: therapist._id,
        score: therapist.score,
        factors: therapist.factors
      }));
      recommendation.status = 'completed';
      recommendation.metadata = {
        processingTime: Date.now() - recommendation.createdAt,
        totalCandidates: candidates.length,
        filteredCandidates: rankedTherapists.length,
        version: '1.0'
      };
      await recommendation.save();

      // Cache recommendations
      await redis.setex(
        `recommendations:${userId}`,
        3600, // 1 hour
        JSON.stringify(recommendation)
      );

      return recommendation;
    } catch (error) {
      logger.error('Recommendations generation failed:', error);
      throw error;
    }
  }

  /**
   * Content-Based Filtering
   */
  async #generateContentBasedScores(userPreferences, candidates) {
    try {
      // Extract user features
      const userFeatures = await extractFeatures(userPreferences);

      // Get or compute content similarities
      const similarities = await Promise.all(
        candidates.map(async (therapist) => {
          let similarity = await ContentSimilarity.findOne({
            therapist: therapist._id,
            lastUpdated: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
          });

          if (!similarity) {
            const features = await extractFeatures(therapist);
            similarity = await ContentSimilarity.create({
              therapist: therapist._id,
              ...computeContentSimilarity(userFeatures, features)
            });
          }

          return {
            therapist: therapist._id,
            score: similarity.score,
            factors: similarity.factors
          };
        })
      );

      return similarities;
    } catch (error) {
      logger.error('Content-based scoring failed:', error);
      throw error;
    }
  }

  /**
   * Collaborative Filtering
   */
  async #generateCollaborativeScores(userId, candidates) {
    try {
      // Get user similarities
      let userSimilarity = await UserSimilarity.findOne({
        user: userId,
        lastUpdated: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
      });

      if (!userSimilarity) {
        userSimilarity = await this.#updateUserSimilarities(userId);
      }

      // Calculate collaborative scores
      const scores = candidates.map(therapist => {
        const score = computeUserSimilarity(userSimilarity, therapist);
        return {
          therapist: therapist._id,
          score,
          factors: {
            userSimilarity: score,
            commonPatients: userSimilarity.commonPatients[therapist._id] || 0,
            averageRating: therapist.ratings.average || 0
          }
        };
      });

      return scores;
    } catch (error) {
      logger.error('Collaborative scoring failed:', error);
      throw error;
    }
  }

  /**
   * Feedback Collection
   */
  async recordFeedback(recommendationId, userId, therapistId, action, position) {
    try {
      const feedback = await Feedback.create({
        recommendation: recommendationId,
        user: userId,
        therapist: therapistId,
        action,
        position
      });

      // Update user similarity scores asynchronously
      this.#updateUserSimilarities(userId).catch(error => {
        logger.error('User similarities update failed:', error);
      });

      return feedback;
    } catch (error) {
      logger.error('Feedback recording failed:', error);
      throw error;
    }
  }

  async updateSessionOutcome(feedbackId, outcome) {
    try {
      const feedback = await Feedback.findById(feedbackId);
      if (!feedback) {
        throw new ApiError(404, 'Feedback not found');
      }

      feedback.sessionOutcome = outcome;
      await feedback.save();

      // Invalidate cached recommendations
      await redis.del(`recommendations:${feedback.user}`);

      return feedback;
    } catch (error) {
      logger.error('Session outcome update failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  async #getCandidateTherapists(filters) {
    const query = {
      role: 'therapist',
      isActive: true,
      isVerified: true
    };

    if (filters.categories) {
      query['specialties.categories'] = { $in: filters.categories };
    }
    if (filters.specialties) {
      query['specialties.name'] = { $in: filters.specialties };
    }
    if (filters.availability) {
      query['availability.slots'] = { $in: filters.availability };
    }
    if (filters.priceRange) {
      query['pricing.sessionPrice'] = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }
    if (filters.location && filters.radius) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: filters.location.coordinates
          },
          $maxDistance: filters.radius * 1000 // Convert to meters
        }
      };
    }

    return User.find(query)
      .select('firstName lastName avatar specialties pricing availability rating')
      .limit(100);
  }

  async #updateUserSimilarities(userId) {
    try {
      // Get user's interactions
      const userInteractions = await Feedback.find({ user: userId })
        .populate('therapist');

      // Get other users with similar interactions
      const similarUsers = await Feedback.aggregate([
        {
          $match: {
            user: { $ne: userId },
            therapist: {
              $in: userInteractions.map(i => i.therapist._id)
            }
          }
        },
        {
          $group: {
            _id: '$user',
            interactions: { $push: '$$ROOT' }
          }
        }
      ]);

      // Compute and update similarities
      await Promise.all(
        similarUsers.map(async (similarUser) => {
          const similarity = computeUserSimilarity(
            userInteractions,
            similarUser.interactions
          );

          await UserSimilarity.findOneAndUpdate(
            {
              user1: userId,
              user2: similarUser._id
            },
            {
              similarity,
              lastCalculated: new Date()
            },
            { upsert: true }
          );
        })
      );
    } catch (error) {
      logger.error('User similarities update failed:', error);
      throw error;
    }
  }
}

export default new RecommendationService();
