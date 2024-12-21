import mongoose from 'mongoose';

const backupConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['full', 'incremental', 'differential'],
    required: true
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      required: true
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: function() {
        return this.schedule.frequency === 'weekly';
      }
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
      required: function() {
        return this.schedule.frequency === 'monthly';
      }
    },
    hour: {
      type: Number,
      min: 0,
      max: 23,
      required: function() {
        return ['daily', 'weekly', 'monthly'].includes(this.schedule.frequency);
      }
    },
    minute: {
      type: Number,
      min: 0,
      max: 59,
      required: true
    }
  },
  retention: {
    count: {
      type: Number,
      required: true,
      min: 1
    },
    duration: {
      type: Number, // Gün cinsinden
      required: true,
      min: 1
    }
  },
  storage: {
    type: {
      type: String,
      enum: ['local', 's3', 'gcs', 'azure'],
      required: true
    },
    config: {
      type: Map,
      of: String,
      required: true
    }
  },
  compression: {
    enabled: {
      type: Boolean,
      default: true
    },
    algorithm: {
      type: String,
      enum: ['gzip', 'bzip2', 'xz'],
      default: 'gzip'
    },
    level: {
      type: Number,
      min: 1,
      max: 9,
      default: 6
    }
  },
  encryption: {
    enabled: {
      type: Boolean,
      default: true
    },
    algorithm: {
      type: String,
      enum: ['aes-256-cbc', 'aes-256-gcm'],
      default: 'aes-256-gcm'
    },
    keyId: {
      type: String,
      required: function() {
        return this.encryption.enabled;
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'error'],
    default: 'active'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const backupJobSchema = new mongoose.Schema({
  config: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BackupConfig',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['scheduled', 'manual', 'auto'],
    required: true
  },
  startTime: Date,
  endTime: Date,
  size: Number, // Bayt cinsinden
  checksum: String,
  location: {
    type: String,
    required: true
  },
  error: {
    code: String,
    message: String,
    stack: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const restoreJobSchema = new mongoose.Schema({
  backup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BackupJob',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['full', 'partial'],
    required: true
  },
  scope: {
    collections: [String],
    query: mongoose.Schema.Types.Mixed
  },
  startTime: Date,
  endTime: Date,
  verificationStatus: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  error: {
    code: String,
    message: String,
    stack: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
backupConfigSchema.index({ status: 1 });
backupConfigSchema.index({ 'schedule.frequency': 1 });

backupJobSchema.index({ config: 1, status: 1 });
backupJobSchema.index({ startTime: 1 });
backupJobSchema.index({ type: 1 });

restoreJobSchema.index({ backup: 1, status: 1 });
restoreJobSchema.index({ startTime: 1 });
restoreJobSchema.index({ type: 1 });

// BackupConfig metodları
backupConfigSchema.methods.pause = async function() {
  this.status = 'paused';
  await this.save();
};

backupConfigSchema.methods.resume = async function() {
  this.status = 'active';
  await this.save();
};

backupConfigSchema.methods.calculateNextRunTime = function() {
  const now = new Date();
  const schedule = this.schedule;
  let nextRun = new Date(now);

  switch (schedule.frequency) {
    case 'hourly':
      nextRun.setMinutes(schedule.minute);
      if (nextRun <= now) {
        nextRun.setHours(nextRun.getHours() + 1);
      }
      break;

    case 'daily':
      nextRun.setHours(schedule.hour, schedule.minute);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;

    case 'weekly':
      nextRun.setHours(schedule.hour, schedule.minute);
      const daysUntilNext = (schedule.dayOfWeek - nextRun.getDay() + 7) % 7;
      nextRun.setDate(nextRun.getDate() + daysUntilNext);
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;

    case 'monthly':
      nextRun.setHours(schedule.hour, schedule.minute);
      nextRun.setDate(schedule.dayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
  }

  return nextRun;
};

// BackupJob metodları
backupJobSchema.methods.start = async function() {
  this.status = 'running';
  this.startTime = new Date();
  await this.save();
};

backupJobSchema.methods.complete = async function(size, checksum) {
  this.status = 'completed';
  this.endTime = new Date();
  this.size = size;
  this.checksum = checksum;
  await this.save();
};

backupJobSchema.methods.fail = async function(error) {
  this.status = 'failed';
  this.endTime = new Date();
  this.error = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack
  };
  await this.save();
};

// RestoreJob metodları
restoreJobSchema.methods.start = async function() {
  this.status = 'running';
  this.startTime = new Date();
  await this.save();
};

restoreJobSchema.methods.complete = async function(verificationStatus) {
  this.status = 'completed';
  this.endTime = new Date();
  this.verificationStatus = verificationStatus;
  await this.save();
};

restoreJobSchema.methods.fail = async function(error) {
  this.status = 'failed';
  this.endTime = new Date();
  this.error = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack
  };
  await this.save();
};

const BackupConfig = mongoose.model('BackupConfig', backupConfigSchema);
const BackupJob = mongoose.model('BackupJob', backupJobSchema);
const RestoreJob = mongoose.model('RestoreJob', restoreJobSchema);

export {
  BackupConfig,
  BackupJob,
  RestoreJob
};
