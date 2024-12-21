import { redis } from '../config/database.js';
import Appointment from '../models/appointment.model.js';
import Therapist from '../models/therapist.model.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { sendAppointmentConfirmation } from '../utils/email.js';
import { generateMeetingLink } from '../utils/meeting.js';

class AppointmentService {
  /**
   * Create new appointment
   */
  async createAppointment(clientId, appointmentData) {
    try {
      // Validate therapist availability
      const therapist = await Therapist.findById(appointmentData.therapist);
      if (!therapist) {
        throw new ApiError(404, 'Therapist not found');
      }

      // Validate session type and price
      const sessionType = therapist.sessionTypes.find(
        type => type.type === appointmentData.sessionType.type &&
        type.duration === appointmentData.sessionType.duration
      );

      if (!sessionType) {
        throw new ApiError(400, 'Invalid session type or duration');
      }

      // Create appointment with validated price
      const appointment = await Appointment.create({
        client: clientId,
        therapist: appointmentData.therapist,
        sessionType: {
          type: sessionType.type,
          duration: sessionType.duration,
          price: sessionType.price
        },
        dateTime: appointmentData.dateTime
      });

      // Generate meeting link
      const meetingLink = await generateMeetingLink(appointment);
      appointment.meetingLink = meetingLink;
      await appointment.save();

      // Send confirmation emails
      await sendAppointmentConfirmation(appointment.client.email, {
        date: appointment.dateTime.toLocaleDateString(),
        time: appointment.dateTime.toLocaleTimeString(),
        therapistName: `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
      });

      // Clear cache
      await redis.del(`appointments:${clientId}`);
      await redis.del(`appointments:therapist:${appointmentData.therapist}`);

      return appointment;
    } catch (error) {
      logger.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointment(appointmentId, userId) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('client', 'firstName lastName email')
        .populate('therapist')
        .populate('cancellation.cancelledBy', 'firstName lastName');

      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // Check authorization
      if (appointment.client._id.toString() !== userId &&
          appointment.therapist.user.toString() !== userId) {
        throw new ApiError(403, 'Not authorized to view this appointment');
      }

      return appointment;
    } catch (error) {
      logger.error('Error getting appointment:', error);
      throw error;
    }
  }

  /**
   * Get user appointments
   */
  async getUserAppointments(userId, filters = {}) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = filters;

      // Try to get from cache
      const cacheKey = `appointments:${userId}:${JSON.stringify(filters)}`;
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult);
      }

      // Build query
      const query = { client: userId };
      if (status) query.status = status;
      if (startDate || endDate) {
        query.dateTime = {};
        if (startDate) query.dateTime.$gte = new Date(startDate);
        if (endDate) query.dateTime.$lte = new Date(endDate);
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const appointments = await Appointment.find(query)
        .populate('therapist')
        .sort({ dateTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Appointment.countDocuments(query);

      const result = {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };

      // Cache result
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300); // 5 minutes

      return result;
    } catch (error) {
      logger.error('Error getting user appointments:', error);
      throw error;
    }
  }

  /**
   * Get therapist appointments
   */
  async getTherapistAppointments(therapistId, filters = {}) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = filters;

      const query = { therapist: therapistId };
      if (status) query.status = status;
      if (startDate || endDate) {
        query.dateTime = {};
        if (startDate) query.dateTime.$gte = new Date(startDate);
        if (endDate) query.dateTime.$lte = new Date(endDate);
      }

      const appointments = await Appointment.find(query)
        .populate('client', 'firstName lastName email')
        .sort({ dateTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Appointment.countDocuments(query);

      return {
        appointments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting therapist appointments:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateStatus(appointmentId, userId, status, notes) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // Validate status transition
      if (!this.isValidStatusTransition(appointment.status, status)) {
        throw new ApiError(400, 'Invalid status transition');
      }

      // Update status and notes
      appointment.status = status;
      if (notes) {
        if (appointment.client.toString() === userId) {
          appointment.notes.client = notes;
        } else if (appointment.therapist.user.toString() === userId) {
          appointment.notes.therapist = notes;
        }
      }

      await appointment.save();

      // Send notification email
      await sendAppointmentConfirmation(appointment.client.email, {
        date: appointment.dateTime.toLocaleDateString(),
        time: appointment.dateTime.toLocaleTimeString(),
        therapistName: `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
      });

      // Clear cache
      await redis.del(`appointments:${appointment.client}`);
      await redis.del(`appointments:therapist:${appointment.therapist}`);

      return appointment;
    } catch (error) {
      logger.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, userId, reason) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
      }

      // Check if appointment can be cancelled
      if (!appointment.canBeCancelled()) {
        throw new ApiError(400, 'Appointment cannot be cancelled');
      }

      // Update appointment
      appointment.status = 'cancelled';
      appointment.cancellation = {
        reason,
        cancelledBy: userId,
        cancelledAt: new Date()
      };

      await appointment.save();

      // Send cancellation email
      await sendAppointmentConfirmation(appointment.client.email, {
        date: appointment.dateTime.toLocaleDateString(),
        time: appointment.dateTime.toLocaleTimeString(),
        therapistName: `${appointment.therapist.firstName} ${appointment.therapist.lastName}`
      });

      // Clear cache
      await redis.del(`appointments:${appointment.client}`);
      await redis.del(`appointments:therapist:${appointment.therapist}`);

      return appointment;
    } catch (error) {
      logger.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Add feedback
   */
  async addFeedback(appointmentId, userId, feedback) {
    try {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        client: userId,
        status: 'completed'
      });

      if (!appointment) {
        throw new ApiError(404, 'Completed appointment not found');
      }

      if (appointment.feedback) {
        throw new ApiError(400, 'Feedback already provided');
      }

      appointment.feedback = {
        ...feedback,
        givenAt: new Date()
      };

      await appointment.save();

      // Update therapist rating
      await this.updateTherapistRating(appointment.therapist);

      return appointment;
    } catch (error) {
      logger.error('Error adding feedback:', error);
      throw error;
    }
  }

  /**
   * Helper method to validate status transitions
   */
  isValidStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      scheduled: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'no-show'],
      completed: [],
      cancelled: [],
      'no-show': []
    };

    return validTransitions[currentStatus]?.includes(newStatus);
  }

  /**
   * Helper method to update therapist rating
   */
  async updateTherapistRating(therapistId) {
    try {
      const appointments = await Appointment.find({
        therapist: therapistId,
        'feedback.rating': { $exists: true }
      });

      if (appointments.length === 0) return;

      const totalRating = appointments.reduce((sum, app) => sum + app.feedback.rating, 0);
      const averageRating = totalRating / appointments.length;

      await Therapist.findByIdAndUpdate(therapistId, {
        'rating.average': averageRating,
        'rating.count': appointments.length
      });
    } catch (error) {
      logger.error('Error updating therapist rating:', error);
      throw error;
    }
  }
}

export default new AppointmentService();
