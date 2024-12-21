import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  sessionType: {
    type: {
      type: String,
      enum: ['video', 'chat', 'voice'],
      required: true
    },
    duration: {
      type: Number,
      required: true,
      enum: [30, 45, 60]
    },
    price: {
      type: Number,
      required: true
    }
  },
  dateTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  notes: {
    client: {
      type: String,
      maxlength: 500
    },
    therapist: {
      type: String,
      maxlength: 500
    }
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date
  },
  meetingLink: {
    type: String
  },
  reminder: {
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    givenAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
appointmentSchema.index({ client: 1, dateTime: -1 });
appointmentSchema.index({ therapist: 1, dateTime: -1 });
appointmentSchema.index({ status: 1, dateTime: 1 });
appointmentSchema.index({ paymentStatus: 1 });

// Virtual for duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  return (this.endTime - this.dateTime) / (1000 * 60);
});

// Pre-save middleware to set endTime based on duration
appointmentSchema.pre('save', function(next) {
  if (this.isModified('dateTime') || this.isModified('sessionType.duration')) {
    this.endTime = new Date(this.dateTime.getTime() + this.sessionType.duration * 60000);
  }
  next();
});

// Pre-save middleware to validate appointment time
appointmentSchema.pre('save', async function(next) {
  if (this.isModified('dateTime')) {
    // Check if the appointment time is in the future
    if (this.dateTime <= new Date()) {
      throw new Error('Appointment time must be in the future');
    }

    // Check for overlapping appointments for therapist
    const overlapping = await this.constructor.findOne({
      therapist: this.therapist,
      _id: { $ne: this._id },
      status: { $nin: ['cancelled', 'completed'] },
      $or: [
        {
          dateTime: { $lt: this.endTime },
          endTime: { $gt: this.dateTime }
        }
      ]
    });

    if (overlapping) {
      throw new Error('This time slot overlaps with another appointment');
    }
  }
  next();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const hoursUntilAppointment = (this.dateTime - now) / (1000 * 60 * 60);
  return hoursUntilAppointment >= 24 && this.status === 'scheduled';
};

// Method to check if appointment needs reminder
appointmentSchema.methods.needsReminder = function() {
  const now = new Date();
  const hoursUntilAppointment = (this.dateTime - now) / (1000 * 60 * 60);
  return hoursUntilAppointment <= 24 && !this.reminder.email.sent;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
