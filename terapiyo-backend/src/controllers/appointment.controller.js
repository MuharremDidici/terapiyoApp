import { validationResult } from 'express-validator';
import appointmentService from '../services/appointment.service.js';
import { ApiError } from '../utils/api-error.js';
import { catchAsync } from '../utils/catch-async.js';

class AppointmentController {
  /**
   * Create new appointment
   * @route POST /api/v1/appointments
   */
  createAppointment = catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const appointment = await appointmentService.createAppointment(
      req.user.id,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: appointment
    });
  });

  /**
   * Get appointment by ID
   * @route GET /api/v1/appointments/:id
   */
  getAppointment = catchAsync(async (req, res) => {
    const appointment = await appointmentService.getAppointment(
      req.params.id,
      req.user.id
    );

    res.json({
      status: 'success',
      data: appointment
    });
  });

  /**
   * Get user appointments
   * @route GET /api/v1/appointments/my
   */
  getUserAppointments = catchAsync(async (req, res) => {
    const result = await appointmentService.getUserAppointments(
      req.user.id,
      req.query
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Get therapist appointments
   * @route GET /api/v1/appointments/therapist/:therapistId
   */
  getTherapistAppointments = catchAsync(async (req, res) => {
    const result = await appointmentService.getTherapistAppointments(
      req.params.therapistId,
      req.query
    );

    res.json({
      status: 'success',
      data: result
    });
  });

  /**
   * Update appointment status
   * @route PATCH /api/v1/appointments/:id/status
   */
  updateStatus = catchAsync(async (req, res) => {
    const { status, notes } = req.body;

    const appointment = await appointmentService.updateStatus(
      req.params.id,
      req.user.id,
      status,
      notes
    );

    res.json({
      status: 'success',
      data: appointment
    });
  });

  /**
   * Cancel appointment
   * @route POST /api/v1/appointments/:id/cancel
   */
  cancelAppointment = catchAsync(async (req, res) => {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user.id,
      req.body.reason
    );

    res.json({
      status: 'success',
      data: appointment
    });
  });

  /**
   * Add feedback
   * @route POST /api/v1/appointments/:id/feedback
   */
  addFeedback = catchAsync(async (req, res) => {
    const appointment = await appointmentService.addFeedback(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      status: 'success',
      data: appointment
    });
  });
}

export default new AppointmentController();
