import { validationResult } from 'express-validator';
import calendarService from '../services/calendar.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class CalendarController {
  /**
   * Set availability
   * @route POST /api/v1/calendar/availability
   */
  setAvailability = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const availability = await calendarService.setAvailability(
      req.user.id,
      req.body.weeklySchedule,
      req.body.preferences
    );

    res.status(201).json({
      status: 'success',
      data: availability
    });
  });

  /**
   * Get availability
   * @route GET /api/v1/calendar/availability/:therapistId
   */
  getAvailability = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const availability = await calendarService.getAvailability(
      req.params.therapistId,
      req.query.startDate,
      req.query.endDate
    );

    res.json({
      status: 'success',
      data: availability
    });
  });

  /**
   * Add availability exception
   * @route POST /api/v1/calendar/availability/exceptions
   */
  addException = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const availability = await calendarService.addException(
      req.user.id,
      req.body.date,
      req.body.type,
      req.body.slots
    );

    res.status(201).json({
      status: 'success',
      data: availability
    });
  });

  /**
   * Create calendar event
   * @route POST /api/v1/calendar/events
   */
  createEvent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const event = await calendarService.createEvent(
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: event
    });
  });

  /**
   * Get calendar events
   * @route GET /api/v1/calendar/events
   */
  getEvents = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const events = await calendarService.getEvents(
      req.user.id,
      req.query.startDate,
      req.query.endDate,
      {
        type: req.query.type,
        visibility: req.query.visibility
      }
    );

    res.json({
      status: 'success',
      data: events
    });
  });

  /**
   * Update calendar event
   * @route PATCH /api/v1/calendar/events/:id
   */
  updateEvent = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const event = await calendarService.updateEvent(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: event
    });
  });

  /**
   * Configure calendar sync
   * @route POST /api/v1/calendar/sync/:provider
   */
  configureSync = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const config = await calendarService.configureSyncProvider(
      req.user.id,
      req.params.provider,
      req.body.credentials,
      req.body.settings
    );

    res.status(201).json({
      status: 'success',
      data: config
    });
  });

  /**
   * Sync calendar
   * @route POST /api/v1/calendar/sync/:provider/sync
   */
  syncCalendar = catchAsync(async (req, res) => {
    const config = await calendarService.syncCalendar(
      req.user.id,
      req.params.provider
    );

    res.json({
      status: 'success',
      data: config
    });
  });
}

export default new CalendarController();
