import { Router } from 'express';
import { body, query, param } from 'express-validator';
import calendarController from '../controllers/calendar.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Availability routes
 */
router.post(
  '/availability',
  authenticate,
  authorize(['therapist']),
  [
    body('weeklySchedule').isArray(),
    body('weeklySchedule.*.day').isIn([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ]),
    body('weeklySchedule.*.slots').isArray(),
    body('weeklySchedule.*.slots.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('weeklySchedule.*.slots.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('weeklySchedule.*.slots.*.isAvailable').isBoolean(),
    body('weeklySchedule.*.slots.*.sessionType').isIn(['online', 'inPerson', 'both']),
    body('preferences').optional().isObject(),
    body('preferences.sessionDuration').optional().isInt({ min: 30, max: 120 }),
    body('preferences.breakDuration').optional().isInt({ min: 5, max: 30 }),
    body('preferences.maxDailyHours').optional().isInt({ min: 1, max: 12 }),
    body('preferences.timezone').optional().isString(),
    body('preferences.autoConfirm').optional().isBoolean()
  ],
  calendarController.setAvailability
);

router.get(
  '/availability/:therapistId',
  [
    param('therapistId').isMongoId(),
    query('startDate').isISO8601(),
    query('endDate').isISO8601()
  ],
  calendarController.getAvailability
);

router.post(
  '/availability/exceptions',
  authenticate,
  authorize(['therapist']),
  [
    body('date').isISO8601(),
    body('type').isIn(['unavailable', 'modified']),
    body('slots').optional().isArray(),
    body('slots.*.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('slots.*.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('slots.*.isAvailable').optional().isBoolean(),
    body('slots.*.sessionType').optional().isIn(['online', 'inPerson', 'both'])
  ],
  calendarController.addException
);

/**
 * Calendar event routes
 */
router.post(
  '/events',
  authenticate,
  [
    body('type').isIn(['appointment', 'break', 'holiday', 'custom']),
    body('title').isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('isAllDay').optional().isBoolean(),
    body('recurrence').optional().isObject(),
    body('recurrence.type').optional().isIn(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
    body('recurrence.interval').optional().isInt({ min: 1 }),
    body('recurrence.endDate').optional().isISO8601(),
    body('recurrence.daysOfWeek').optional().isArray(),
    body('recurrence.daysOfWeek.*').optional().isInt({ min: 0, max: 6 }),
    body('recurrence.excludeDates').optional().isArray(),
    body('recurrence.excludeDates.*').optional().isISO8601(),
    body('location').optional().isObject(),
    body('location.type').optional().isIn(['online', 'physical', 'hybrid']),
    body('location.address').optional().isString(),
    body('location.coordinates').optional().isObject(),
    body('location.coordinates.lat').optional().isFloat({ min: -90, max: 90 }),
    body('location.coordinates.lng').optional().isFloat({ min: -180, max: 180 }),
    body('location.meetingLink').optional().isURL(),
    body('color').optional().isString(),
    body('visibility').optional().isIn(['public', 'private']),
    body('reminders').optional().isArray(),
    body('reminders.*.type').optional().isIn(['email', 'sms', 'push', 'whatsapp']),
    body('reminders.*.before').optional().isInt({ min: 5 })
  ],
  calendarController.createEvent
);

router.get(
  '/events',
  authenticate,
  [
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('type').optional().isIn(['appointment', 'break', 'holiday', 'custom']),
    query('visibility').optional().isIn(['public', 'private'])
  ],
  calendarController.getEvents
);

router.patch(
  '/events/:id',
  authenticate,
  [
    param('id').isMongoId(),
    body('type').optional().isIn(['appointment', 'break', 'holiday', 'custom']),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('startTime').optional().isISO8601(),
    body('endTime').optional().isISO8601(),
    body('isAllDay').optional().isBoolean(),
    body('recurrence').optional().isObject(),
    body('location').optional().isObject(),
    body('color').optional().isString(),
    body('visibility').optional().isIn(['public', 'private']),
    body('reminders').optional().isArray()
  ],
  calendarController.updateEvent
);

/**
 * Calendar sync routes
 */
router.post(
  '/sync/:provider',
  authenticate,
  [
    param('provider').isIn(['google', 'outlook', 'apple']),
    body('credentials').isObject(),
    body('credentials.accessToken').isString(),
    body('credentials.refreshToken').isString(),
    body('settings').isObject(),
    body('settings.calendar').optional().isObject(),
    body('settings.syncDirection').optional().isIn(['import', 'export', 'both']),
    body('settings.eventTypes').optional().isArray()
  ],
  calendarController.configureSync
);

router.post(
  '/sync/:provider/sync',
  authenticate,
  [
    param('provider').isIn(['google', 'outlook', 'apple'])
  ],
  calendarController.syncCalendar
);

export default router;
