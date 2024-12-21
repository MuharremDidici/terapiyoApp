import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'system'],
    default: 'text'
  },
  content: {
    text: String,
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    mimeType: String,
    duration: Number,
    thumbnail: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  metadata: {
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startIndex: Number,
      endIndex: Number
    }],
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      type: {
        type: String,
        enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: {
      type: String,
      required: true
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedFor: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],
  systemData: {
    type: {
      type: String,
      enum: [
        'user_joined',
        'user_left',
        'chat_created',
        'chat_updated',
        'appointment_reminder',
        'payment_reminder',
        'document_shared'
      ]
    },
    data: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['individual', 'group', 'channel', 'support'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true
      },
      muteUntil: Date
    }
  }],
  metadata: {
    name: String,
    description: String,
    avatar: String,
    isPrivate: {
      type: Boolean,
      default: false
    },
    customData: mongoose.Schema.Types.Mixed
  },
  settings: {
    messageRetention: {
      type: Number,
      default: 30 // days
    },
    maxParticipants: {
      type: Number,
      default: 100
    },
    allowedMessageTypes: [{
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video', 'location']
    }],
    moderationEnabled: {
      type: Boolean,
      default: false
    },
    autoDeleteMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number,
        default: 24 // hours
      }
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  }
}, {
  timestamps: true
});

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'message',
      'mention',
      'reaction',
      'appointment',
      'payment',
      'review',
      'document',
      'system'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  channels: [{
    type: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    error: String
  }],
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  readAt: Date,
  expiresAt: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'metadata.replyTo': 1 });
messageSchema.index({ 'metadata.mentions.user': 1 });

chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ status: 1 });
chatSchema.index({ 'metadata.isPrivate': 1 });

notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 });

// Methods
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.readBy.some(read => read.user.equals(userId))) {
    this.readBy.push({ user: userId });
    this.status = 'read';
    await this.save();
  }
};

messageSchema.methods.addReaction = async function(userId, reactionType) {
  const existingReaction = this.metadata.reactions.find(
    reaction => reaction.user.equals(userId)
  );

  if (existingReaction) {
    existingReaction.type = reactionType;
  } else {
    this.metadata.reactions.push({
      user: userId,
      type: reactionType
    });
  }

  await this.save();
};

chatSchema.methods.addParticipant = async function(userId, role = 'member') {
  if (!this.participants.some(p => p.user.equals(userId))) {
    this.participants.push({
      user: userId,
      role
    });
    await this.save();
  }
};

chatSchema.methods.removeParticipant = async function(userId) {
  const index = this.participants.findIndex(p => p.user.equals(userId));
  if (index !== -1) {
    this.participants[index].isActive = false;
    await this.save();
  }
};

notificationSchema.methods.markAsRead = async function() {
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
};

// Statics
messageSchema.statics.findUnreadCount = async function(userId) {
  return this.countDocuments({
    'readBy.user': { $ne: userId },
    sender: { $ne: userId },
    isDeleted: false
  });
};

chatSchema.statics.findActiveChats = async function(userId) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    status: 'active'
  });
};

notificationSchema.statics.findUnreadNotifications = async function(userId) {
  return this.find({
    recipient: userId,
    status: 'unread',
    expiresAt: { $gt: new Date() }
  }).sort('-createdAt');
};

const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Notification = mongoose.model('Notification', notificationSchema);

export { Message, Chat, Notification };
