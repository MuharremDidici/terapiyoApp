import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weeklySchedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    slots: [{
      startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      isAvailable: {
        type: Boolean,
        default: true
      },
      sessionType: {
        type: String,
        enum: ['online', 'inPerson', 'both'],
        default: 'both'
      }
    }]
  }],
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['unavailable', 'modified'],
      required: true
    },
    slots: [{
      startTime: String,
      endTime: String,
      isAvailable: Boolean,
      sessionType: {
        type: String,
        enum: ['online', 'inPerson', 'both']
      }
    }]
  }],
  preferences: {
    sessionDuration: {
      type: Number,
      default: 50,
      min: 30,
      max: 120
    },
    breakDuration: {
      type: Number,
      default: 10,
      min: 5,
      max: 30
    },
    maxDailyHours: {
      type: Number,
      default: 8,
      min: 1,
      max: 12
    },
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    },
    autoConfirm: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const reminderSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'whatsapp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  sentAt: Date,
  metadata: {
    template: String,
    locale: String,
    data: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const calendarEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'break', 'holiday', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number],
    excludeDates: [Date]
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical', 'hybrid']
    },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    meetingLink: String
  },
  color: String,
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'whatsapp']
    },
    before: {
      type: Number,
      min: 5
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const syncConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['google', 'outlook', 'apple'],
    required: true
  },
  credentials: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  },
  settings: {
    calendar: {
      id: String,
      name: String
    },
    syncDirection: {
      type: String,
      enum: ['import', 'export', 'both'],
      default: 'both'
    },
    eventTypes: [{
      type: String,
      enum: ['appointment', 'break', 'holiday', 'custom']
    }],
    lastSync: Date
  },
  status: {
    type: String,
    enum: ['active', 'disconnected', 'error'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
availabilitySchema.index({ therapist: 1 });
availabilitySchema.index({ 'exceptions.date': 1 });

reminderSchema.index({ appointment: 1 });
reminderSchema.index({ user: 1 });
reminderSchema.index({ scheduledFor: 1, status: 1 });

calendarEventSchema.index({ user: 1 });
calendarEventSchema.index({ startTime: 1, endTime: 1 });
calendarEventSchema.index({ type: 1, user: 1 });

syncConfigSchema.index({ user: 1, provider: 1 }, { unique: true });
syncConfigSchema.index({ 'credentials.expiresAt': 1 });

// Methods
availabilitySchema.methods.isAvailable = function(date, startTime, endTime) {
  // Implementation for checking availability
};

availabilitySchema.methods.addException = function(date, type, slots = []) {
  this.exceptions.push({
    date,
    type,
    slots
  });
};

calendarEventSchema.methods.addReminder = function(type, before) {
  this.reminders.push({ type, before });
};

calendarEventSchema.methods.updateRecurrence = function(recurrence) {
  this.recurrence = {
    ...this.recurrence,
    ...recurrence
  };
};

// Statics
availabilitySchema.statics.findAvailableSlots = async function(therapistId, date) {
  // Implementation for finding available slots
};

reminderSchema.statics.findPendingReminders = async function() {
  return this.find({
    status: 'pending',
    scheduledFor: { $lte: new Date() }
  });
};

calendarEventSchema.statics.findOverlappingEvents = async function(userId, startTime, endTime) {
  return this.find({
    user: userId,
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $gte: startTime, $lt: endTime }
      }
    ]
  });
};

const Availability = mongoose.model('Availability', availabilitySchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
const SyncConfig = mongoose.model('SyncConfig', syncConfigSchema);

export { Availability, Reminder, CalendarEvent, SyncConfig };
