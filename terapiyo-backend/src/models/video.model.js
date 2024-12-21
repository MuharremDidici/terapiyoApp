import mongoose from 'mongoose';

const videoSessionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'failed'],
    default: 'scheduled'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  actualStartTime: Date,
  actualEndTime: Date,
  duration: Number, // in minutes
  quality: {
    resolution: String,
    frameRate: Number,
    bitrate: Number,
    packetLoss: Number,
    jitter: Number,
    latency: Number
  },
  features: {
    screenSharing: {
      type: Boolean,
      default: true
    },
    recording: {
      type: Boolean,
      default: false
    },
    chat: {
      type: Boolean,
      default: true
    },
    whiteboard: {
      type: Boolean,
      default: true
    },
    fileSharing: {
      type: Boolean,
      default: true
    },
    backgroundBlur: {
      type: Boolean,
      default: true
    }
  },
  recording: {
    enabled: {
      type: Boolean,
      default: false
    },
    url: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    size: Number,
    format: String,
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    }
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['host', 'participant', 'observer'],
      default: 'participant'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number,
    device: {
      type: String,
      browser: String,
      os: String,
      version: String
    },
    network: {
      type: String,
      quality: String,
      ip: String
    },
    media: {
      video: {
        enabled: Boolean,
        deviceId: String,
        resolution: String,
        frameRate: Number
      },
      audio: {
        enabled: Boolean,
        deviceId: String,
        codec: String,
        sampleRate: Number
      },
      screen: {
        shared: Boolean,
        startTime: Date,
        endTime: Date
      }
    }
  }],
  chat: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    type: {
      type: String,
      enum: ['text', 'file'],
      default: 'text'
    },
    fileUrl: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  whiteboard: {
    enabled: Boolean,
    data: String, // JSON string of whiteboard data
    snapshots: [{
      url: String,
      timestamp: Date,
      creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  notes: {
    content: String,
    lastUpdated: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    qualityScore: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    issues: [{
      type: String,
      enum: [
        'audio_quality',
        'video_quality',
        'connection_stability',
        'feature_issues',
        'other'
      ]
    }],
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  settings: {
    maxParticipants: {
      type: Number,
      default: 2
    },
    videoQuality: {
      type: String,
      enum: ['low', 'medium', 'high', 'hd'],
      default: 'high'
    },
    audioQuality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'high'
    },
    layout: {
      type: String,
      enum: ['grid', 'spotlight', 'sidebar'],
      default: 'grid'
    },
    autoRecording: {
      type: Boolean,
      default: false
    },
    requireAuthentication: {
      type: Boolean,
      default: true
    },
    waitingRoom: {
      type: Boolean,
      default: true
    },
    notifications: {
      reminder: {
        enabled: {
          type: Boolean,
          default: true
        },
        timing: {
          type: Number,
          default: 15 // minutes before session
        }
      },
      missedCall: {
        type: Boolean,
        default: true
      },
      recording: {
        type: Boolean,
        default: true
      }
    }
  },
  meta: {
    platform: String,
    sdkVersion: String,
    iceServers: [{
      url: String,
      username: String,
      credential: String
    }],
    region: String,
    tags: [String],
    customData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
videoSessionSchema.index({ appointment: 1 });
videoSessionSchema.index({ therapist: 1 });
videoSessionSchema.index({ client: 1 });
videoSessionSchema.index({ status: 1 });
videoSessionSchema.index({ startTime: 1 });
videoSessionSchema.index({ 'participants.user': 1 });

// Methods
videoSessionSchema.methods.updateStatus = async function(status) {
  this.status = status;
  if (status === 'in_progress' && !this.actualStartTime) {
    this.actualStartTime = new Date();
  } else if (status === 'completed' && !this.actualEndTime) {
    this.actualEndTime = new Date();
    this.duration = Math.round((this.actualEndTime - this.actualStartTime) / 60000); // Convert to minutes
  }
  await this.save();
};

videoSessionSchema.methods.addParticipant = async function(userId, role = 'participant') {
  if (!this.participants.some(p => p.user.equals(userId))) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date()
    });
    await this.save();
  }
};

videoSessionSchema.methods.removeParticipant = async function(userId) {
  const participant = this.participants.find(p => p.user.equals(userId));
  if (participant) {
    participant.leftAt = new Date();
    participant.duration = Math.round((participant.leftAt - participant.joinedAt) / 60000);
    await this.save();
  }
};

videoSessionSchema.methods.addChatMessage = async function(userId, content, type = 'text', fileUrl = null) {
  this.chat.push({
    sender: userId,
    content,
    type,
    fileUrl
  });
  await this.save();
};

videoSessionSchema.methods.updateQuality = async function(qualityData) {
  this.quality = { ...this.quality, ...qualityData };
  await this.save();
};

// Statics
videoSessionSchema.statics.findActiveSessionsByUser = async function(userId) {
  return this.find({
    $or: [
      { therapist: userId },
      { client: userId }
    ],
    status: 'in_progress'
  });
};

videoSessionSchema.statics.findUpcomingSessions = async function(userId, limit = 10) {
  return this.find({
    $or: [
      { therapist: userId },
      { client: userId }
    ],
    status: 'scheduled',
    startTime: { $gt: new Date() }
  })
    .sort('startTime')
    .limit(limit);
};

const VideoSession = mongoose.model('VideoSession', videoSessionSchema);

export default VideoSession;
