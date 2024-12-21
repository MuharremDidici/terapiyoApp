import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  targetId: mongoose.Schema.Types.ObjectId,
  value: Number,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'platform_overview',
      'user_activity',
      'therapist_performance',
      'financial',
      'satisfaction',
      'custom'
    ]
  },
  period: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  metrics: [{
    name: String,
    value: Number,
    unit: String,
    trend: {
      direction: {
        type: String,
        enum: ['up', 'down', 'stable']
      },
      percentage: Number
    }
  }],
  segments: [{
    name: String,
    metrics: [{
      name: String,
      value: Number,
      unit: String
    }]
  }],
  charts: [{
    type: {
      type: String,
      enum: ['line', 'bar', 'pie', 'table']
    },
    title: String,
    data: mongoose.Schema.Types.Mixed,
    options: mongoose.Schema.Types.Mixed
  }],
  insights: [{
    type: {
      type: String,
      enum: ['highlight', 'trend', 'anomaly', 'recommendation']
    },
    title: String,
    description: String,
    importance: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  metadata: {
    generatedBy: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    filters: mongoose.Schema.Types.Mixed,
    version: String
  }
}, {
  timestamps: true
});

const dashboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'custom'],
    default: 'custom'
  },
  layout: [{
    id: String,
    type: {
      type: String,
      enum: ['metric', 'chart', 'table', 'list']
    },
    title: String,
    dataSource: {
      type: String,
      required: true
    },
    options: mongoose.Schema.Types.Mixed,
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    }
  }],
  filters: {
    dateRange: {
      start: Date,
      end: Date
    },
    custom: mongoose.Schema.Types.Mixed
  },
  refreshInterval: Number,
  isPublic: {
    type: Boolean,
    default: false
  },
  lastRefreshed: Date
}, {
  timestamps: true
});

// Indexes
metricSchema.index({ name: 1, timestamp: -1 });
metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

eventSchema.index({ type: 1, timestamp: -1 });
eventSchema.index({ user: 1, timestamp: -1 });
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

reportSchema.index({ type: 1, 'period.start': -1 });
reportSchema.index({ 'metadata.generatedAt': 1 });

dashboardSchema.index({ user: 1, name: 1 }, { unique: true });
dashboardSchema.index({ isPublic: 1 });

// Methods for Report
reportSchema.methods.addInsight = function(insight) {
  this.insights.push(insight);
};

reportSchema.methods.addChart = function(chart) {
  this.charts.push(chart);
};

reportSchema.methods.addMetric = function(metric) {
  this.metrics.push(metric);
};

// Statics for Report
reportSchema.statics.generatePlatformOverview = async function(period) {
  // Implementation for generating platform overview report
};

reportSchema.statics.generateTherapistPerformance = async function(therapistId, period) {
  // Implementation for generating therapist performance report
};

reportSchema.statics.generateFinancialReport = async function(period) {
  // Implementation for generating financial report
};

// Methods for Dashboard
dashboardSchema.methods.refresh = async function() {
  this.lastRefreshed = new Date();
  await this.save();
};

dashboardSchema.methods.addWidget = function(widget) {
  this.layout.push(widget);
};

dashboardSchema.methods.updateLayout = function(newLayout) {
  this.layout = newLayout;
};

const Metric = mongoose.model('Metric', metricSchema);
const Event = mongoose.model('Event', eventSchema);
const Report = mongoose.model('Report', reportSchema);
const Dashboard = mongoose.model('Dashboard', dashboardSchema);

export { Metric, Event, Report, Dashboard };
