import mongoose from 'mongoose';

const testSuiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: [
      'unit',
      'integration',
      'e2e',
      'performance',
      'security',
      'accessibility'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  dependencies: [{
    type: String
  }],
  configuration: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  lastRun: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const testCaseSchema = new mongoose.Schema({
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  steps: [{
    name: String,
    action: String,
    expectedResult: String,
    timeout: Number
  }],
  preconditions: [{
    type: String
  }],
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  tags: [{
    type: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  automated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  }
}, {
  timestamps: true
});

const testRunSchema = new mongoose.Schema({
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite',
    required: true
  },
  environment: {
    type: String,
    required: true,
    enum: ['development', 'staging', 'production']
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  results: [{
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase'
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'skipped', 'blocked', 'error']
    },
    duration: Number,
    error: {
      message: String,
      stack: String,
      screenshot: String
    },
    logs: [{
      level: String,
      message: String,
      timestamp: Date
    }]
  }],
  summary: {
    total: Number,
    passed: Number,
    failed: Number,
    skipped: Number,
    blocked: Number,
    error: Number,
    duration: Number
  },
  startTime: Date,
  endTime: Date,
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const testMetricSchema = new mongoose.Schema({
  suite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSuite'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'coverage',
      'performance',
      'reliability',
      'maintainability'
    ]
  },
  value: {
    type: Number,
    required: true
  },
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

// Endeks tanımlamaları
testSuiteSchema.index({ type: 1, status: 1 });

testCaseSchema.index({ suite: 1, name: 1 });
testCaseSchema.index({ tags: 1 });
testCaseSchema.index({ status: 1 });

testRunSchema.index({ suite: 1, environment: 1 });
testRunSchema.index({ status: 1, startTime: -1 });

testMetricSchema.index({ suite: 1, type: 1, timestamp: -1 });

// Test Suite metodları
testSuiteSchema.methods.updateLastRun = async function() {
  this.lastRun = new Date();
  await this.save();
};

// Test Run metodları
testRunSchema.methods.updateSummary = function() {
  const summary = {
    total: this.results.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    blocked: 0,
    error: 0,
    duration: 0
  };

  for (const result of this.results) {
    summary[result.status]++;
    summary.duration += result.duration || 0;
  }

  this.summary = summary;
};

testRunSchema.methods.addResult = async function(result) {
  this.results.push(result);
  this.updateSummary();
  await this.save();
};

// Test Metric metodları
testMetricSchema.statics.calculateCoverage = async function(suiteId) {
  // Test kapsamını hesapla
  // TODO: Test kapsamı hesaplama mantığı
};

const TestSuite = mongoose.model('TestSuite', testSuiteSchema);
const TestCase = mongoose.model('TestCase', testCaseSchema);
const TestRun = mongoose.model('TestRun', testRunSchema);
const TestMetric = mongoose.model('TestMetric', testMetricSchema);

export {
  TestSuite,
  TestCase,
  TestRun,
  TestMetric
};
