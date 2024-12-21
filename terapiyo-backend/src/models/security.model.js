import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'create',
      'update',
      'delete',
      'view',
      'download',
      'upload',
      'share',
      'authorize'
    ]
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ip: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const securityAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'suspicious_login',
      'brute_force',
      'rate_limit',
      'permission_violation',
      'data_leak',
      'api_abuse',
      'malware_detected'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  source: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  affectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'false_positive'],
    default: 'open'
  },
  resolution: {
    action: String,
    notes: String,
    timestamp: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const securityPolicySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'password',
      'session',
      'rate_limit',
      'access_control',
      'data_retention',
      'encryption'
    ]
  },
  description: String,
  rules: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const securityConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    enum: [
      'authentication',
      'authorization',
      'encryption',
      'monitoring',
      'compliance'
    ]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, resource: 1 });
auditLogSchema.index({ status: 1 });

securityAlertSchema.index({ type: 1, severity: 1 });
securityAlertSchema.index({ status: 1, timestamp: -1 });
securityAlertSchema.index({ 'affectedUsers': 1 });

securityPolicySchema.index({ type: 1 });
securityPolicySchema.index({ 'rules.name': 1 });

securityConfigSchema.index({ category: 1 });

// Statik metodlar
securityAlertSchema.statics.createAlert = async function(alertData) {
  const alert = new this(alertData);
  await alert.save();
  
  // E-posta bildirimi gönder
  if (alert.severity === 'high' || alert.severity === 'critical') {
    // TODO: E-posta gönderme işlemi
  }
  
  return alert;
};

// Örnek güvenlik politikası oluştur
securityPolicySchema.statics.createDefaultPolicies = async function() {
  const defaultPolicies = [
    {
      name: 'password_policy',
      type: 'password',
      description: 'Şifre güvenlik politikası',
      rules: [
        { name: 'min_length', value: 8 },
        { name: 'require_uppercase', value: true },
        { name: 'require_lowercase', value: true },
        { name: 'require_number', value: true },
        { name: 'require_special', value: true },
        { name: 'max_age_days', value: 90 },
        { name: 'prevent_reuse', value: 5 }
      ]
    },
    {
      name: 'session_policy',
      type: 'session',
      description: 'Oturum güvenlik politikası',
      rules: [
        { name: 'max_duration_minutes', value: 60 },
        { name: 'idle_timeout_minutes', value: 15 },
        { name: 'max_concurrent_sessions', value: 3 },
        { name: 'require_2fa', value: true }
      ]
    },
    {
      name: 'rate_limit_policy',
      type: 'rate_limit',
      description: 'API hız sınırı politikası',
      rules: [
        { name: 'requests_per_minute', value: 60 },
        { name: 'burst_size', value: 10 },
        { name: 'penalty_minutes', value: 15 }
      ]
    }
  ];

  for (const policy of defaultPolicies) {
    await this.findOneAndUpdate(
      { name: policy.name },
      policy,
      { upsert: true, new: true }
    );
  }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const SecurityAlert = mongoose.model('SecurityAlert', securityAlertSchema);
const SecurityPolicy = mongoose.model('SecurityPolicy', securityPolicySchema);
const SecurityConfig = mongoose.model('SecurityConfig', securityConfigSchema);

export {
  AuditLog,
  SecurityAlert,
  SecurityPolicy,
  SecurityConfig
};
