import { Availability, Reminder, CalendarEvent, SyncConfig } from '../models/calendar.model.js';
import { redis } from '../config/database.js';
import { ApiError } from '../utils/api-error.js';
import logger from '../config/logger.js';
import { DateTime } from 'luxon';
import { sendEmail } from '../utils/email.js';
import { sendSMS } from '../utils/sms.js';
import { sendPushNotification } from '../utils/push-notification.js';
import { sendWhatsAppMessage } from '../utils/whatsapp.js';

class CalendarService {
  /**
   * Availability Management
   */
  async setAvailability(therapistId, weeklySchedule, preferences) {
    try {
      let availability = await Availability.findOne({ therapist: therapistId });

      if (!availability) {
        availability = new Availability({
          therapist: therapistId,
          weeklySchedule,
          preferences
        });
      } else {
        availability.weeklySchedule = weeklySchedule;
        if (preferences) {
          availability.preferences = {
            ...availability.preferences,
            ...preferences
          };
        }
      }

      await availability.save();
      await this.#clearAvailabilityCache(therapistId);

      return availability;
    } catch (error) {
      logger.error('Setting availability failed:', error);
      throw error;
    }
  }

  async getAvailability(therapistId, startDate, endDate) {
    try {
      const cacheKey = `availability:${therapistId}:${startDate}:${endDate}`;
      let availability = await redis.get(cacheKey);

      if (!availability) {
        availability = await Availability.findOne({ therapist: therapistId });
        if (!availability) {
          throw new ApiError(404, 'Availability not found');
        }

        // Process availability for the date range
        const slots = await this.#processAvailabilityForDateRange(
          availability,
          startDate,
          endDate
        );

        await redis.set(cacheKey, JSON.stringify(slots), 'EX', 3600);
        return slots;
      }

      return JSON.parse(availability);
    } catch (error) {
      logger.error('Getting availability failed:', error);
      throw error;
    }
  }

  async addException(therapistId, date, type, slots = []) {
    try {
      const availability = await Availability.findOne({ therapist: therapistId });
      if (!availability) {
        throw new ApiError(404, 'Availability not found');
      }

      availability.addException(date, type, slots);
      await availability.save();
      await this.#clearAvailabilityCache(therapistId);

      return availability;
    } catch (error) {
      logger.error('Adding exception failed:', error);
      throw error;
    }
  }

  /**
   * Calendar Event Management
   */
  async createEvent(userId, eventData) {
    try {
      // Check for overlapping events
      const overlapping = await CalendarEvent.findOverlappingEvents(
        userId,
        eventData.startTime,
        eventData.endTime
      );

      if (overlapping.length > 0) {
        throw new ApiError(400, 'Event overlaps with existing events');
      }

      const event = new CalendarEvent({
        user: userId,
        ...eventData
      });

      await event.save();

      // Schedule reminders if any
      if (eventData.reminders?.length) {
        await this.#scheduleEventReminders(event);
      }

      return event;
    } catch (error) {
      logger.error('Event creation failed:', error);
      throw error;
    }
  }

  async getEvents(userId, startDate, endDate, filters = {}) {
    try {
      const query = {
        user: userId,
        startTime: { $gte: startDate },
        endTime: { $lte: endDate }
      };

      if (filters.type) {
        query.type = filters.type;
      }
      if (filters.visibility) {
        query.visibility = filters.visibility;
      }

      const events = await CalendarEvent.find(query)
        .sort('startTime')
        .populate('user', 'firstName lastName avatar');

      return events;
    } catch (error) {
      logger.error('Events retrieval failed:', error);
      throw error;
    }
  }

  async updateEvent(eventId, userId, updates) {
    try {
      const event = await CalendarEvent.findOne({
        _id: eventId,
        user: userId
      });

      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      // Check for overlapping events if time is being updated
      if (updates.startTime || updates.endTime) {
        const overlapping = await CalendarEvent.findOverlappingEvents(
          userId,
          updates.startTime || event.startTime,
          updates.endTime || event.endTime
        );

        if (overlapping.length > 0 && overlapping[0]._id.toString() !== eventId) {
          throw new ApiError(400, 'Event overlaps with existing events');
        }
      }

      Object.assign(event, updates);
      await event.save();

      // Reschedule reminders if needed
      if (updates.reminders || updates.startTime) {
        await this.#scheduleEventReminders(event);
      }

      return event;
    } catch (error) {
      logger.error('Event update failed:', error);
      throw error;
    }
  }

  /**
   * Reminder Management
   */
  async scheduleReminder(appointmentId, userId, type, scheduledFor, metadata = {}) {
    try {
      const reminder = new Reminder({
        appointment: appointmentId,
        user: userId,
        type,
        scheduledFor,
        metadata
      });

      await reminder.save();
      return reminder;
    } catch (error) {
      logger.error('Reminder scheduling failed:', error);
      throw error;
    }
  }

  async processReminders() {
    try {
      const pendingReminders = await Reminder.findPendingReminders()
        .populate('appointment')
        .populate('user');

      for (const reminder of pendingReminders) {
        try {
          await this.#sendReminder(reminder);
          reminder.status = 'sent';
          reminder.sentAt = new Date();
        } catch (error) {
          logger.error(`Failed to send reminder ${reminder._id}:`, error);
          reminder.status = 'failed';
        }

        await reminder.save();
      }
    } catch (error) {
      logger.error('Reminder processing failed:', error);
      throw error;
    }
  }

  /**
   * Calendar Sync Management
   */
  async configureSyncProvider(userId, provider, credentials, settings) {
    try {
      let config = await SyncConfig.findOne({ user: userId, provider });

      if (!config) {
        config = new SyncConfig({
          user: userId,
          provider,
          credentials,
          settings
        });
      } else {
        config.credentials = credentials;
        config.settings = {
          ...config.settings,
          ...settings
        };
        config.status = 'active';
      }

      await config.save();
      return config;
    } catch (error) {
      logger.error('Sync configuration failed:', error);
      throw error;
    }
  }

  async syncCalendar(userId, provider) {
    try {
      const config = await SyncConfig.findOne({ user: userId, provider });
      if (!config) {
        throw new ApiError(404, 'Sync configuration not found');
      }

      // Implement provider-specific sync logic here
      switch (provider) {
        case 'google':
          await this.syncWithGoogle(config);
          break;
        case 'outlook':
          await this.syncWithOutlook(config);
          break;
        case 'apple':
          await this.syncWithApple(config);
          break;
        default:
          throw new ApiError(400, 'Unsupported provider');
      }

      config.settings.lastSync = new Date();
      await config.save();

      return config;
    } catch (error) {
      logger.error('Calendar sync failed:', error);
      throw error;
    }
  }

  /**
   * Helper Methods
   */
  async #processAvailabilityForDateRange(availability, startDate, endDate) {
    const slots = [];
    let currentDate = DateTime.fromISO(startDate);
    const endDateTime = DateTime.fromISO(endDate);

    while (currentDate <= endDateTime) {
      const dayOfWeek = currentDate.weekday;
      const daySchedule = availability.weeklySchedule.find(
        schedule => schedule.day === this.#getDayName(dayOfWeek)
      );

      if (daySchedule) {
        const exception = availability.exceptions.find(
          ex => DateTime.fromJSDate(ex.date).hasSame(currentDate, 'day')
        );

        if (exception) {
          if (exception.type === 'modified') {
            slots.push(...this.#processSlots(currentDate, exception.slots));
          }
        } else {
          slots.push(...this.#processSlots(currentDate, daySchedule.slots));
        }
      }

      currentDate = currentDate.plus({ days: 1 });
    }

    return slots;
  }

  #getDayName(weekday) {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ];
    return days[weekday - 1];
  }

  #processSlots(date, slots) {
    return slots.filter(slot => slot.isAvailable).map(slot => ({
      date: date.toISODate(),
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
  }

  async #scheduleEventReminders(event) {
    // Reminder mantığı
  }

  async #sendReminder(reminder) {
    // Hatırlatıcı gönderme mantığı
  }

  async #clearAvailabilityCache(therapistId) {
    const pattern = `availability:${therapistId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new CalendarService();
