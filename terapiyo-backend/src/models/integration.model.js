import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    required: true,
    enum: [
      'google',
      'zoom',
      'stripe',
      'sendgrid',
      'twilio',
      'slack',
      'custom'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: [
      'auth',
      'payment',
      'communication',
      'notification',
      'analytics',
      'storage',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'inactive'
  },
  config: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  credentials: {
    type: Map,
    of: String,
    required: true
  },
  webhooks: [{
    url: String,
    events: [String],
    secret: String,
    active: Boolean
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  lastSync: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const apiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scopes: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active'
  },
  expiresAt: Date,
  lastUsed: Date,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const webhookEventSchema = new mongoose.Schema({
  integration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  event: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  attempts: [{
    timestamp: Date,
    status: String,
    error: String
  }],
  processedAt: Date
}, {
  timestamps: true
});

const apiRequestLogSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  endpoint: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  ip: String,
  userAgent: String,
  params: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  response: {
    status: Number,
    body: mongoose.Schema.Types.Mixed
  },
  duration: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
integrationSchema.index({ provider: 1, status: 1 });
integrationSchema.index({ type: 1 });

apiKeySchema.index({ user: 1 });
apiKeySchema.index({ status: 1 });

webhookEventSchema.index({ integration: 1, event: 1 });
webhookEventSchema.index({ status: 1, createdAt: -1 });

apiRequestLogSchema.index({ method: 1, endpoint: 1 });
apiRequestLogSchema.index({ user: 1, timestamp: -1 });
apiRequestLogSchema.index({ apiKey: 1, timestamp: -1 });

// Integration metodları
integrationSchema.methods.updateStatus = async function(status) {
  this.status = status;
  this.lastSync = new Date();
  await this.save();
};

integrationSchema.methods.addWebhook = async function(webhook) {
  this.webhooks.push(webhook);
  await this.save();
};

// ApiKey metodları
apiKeySchema.methods.revoke = async function() {
  this.status = 'revoked';
  await this.save();
};

apiKeySchema.methods.updateLastUsed = async function() {
  this.lastUsed = new Date();
  await this.save();
};

// Webhook Event metodları
webhookEventSchema.methods.markAsProcessed = async function() {
  this.status = 'processed';
  this.processedAt = new Date();
  await this.save();
};

webhookEventSchema.methods.addAttempt = async function(attempt) {
  this.attempts.push({
    ...attempt,
    timestamp: new Date()
  });
  await this.save();
};

// Statik metodlar
integrationSchema.statics.findByProvider = function(provider) {
  return this.find({ provider, status: 'active' });
};

apiKeySchema.statics.findActiveKeys = function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });
};

webhookEventSchema.statics.findPendingEvents = function(integrationId) {
  return this.find({
    integration: integrationId,
    status: 'pending'
  }).sort({ createdAt: 1 });
};

const Integration = mongoose.model('Integration', integrationSchema);
const ApiKey = mongoose.model('ApiKey', apiKeySchema);
const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);
const ApiRequestLog = mongoose.model('ApiRequestLog', apiRequestLogSchema);

export { ApiKey, WebhookEvent, ApiRequestLog };
export default Integration;
