import mongoose from 'mongoose';

const performanceMetricSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'response_time',
      'cpu_usage',
      'memory_usage',
      'disk_usage',
      'network_io',
      'database_query',
      'cache_hit_ratio',
      'error_rate',
      'concurrent_users'
    ]
  },
  service: {
    type: String,
    required: true
  },
  endpoint: String,
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
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

const resourceUsageSchema = new mongoose.Schema({
  instanceId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['api', 'worker', 'database', 'cache']
  },
  metrics: {
    cpu: {
      usage: Number,
      cores: Number
    },
    memory: {
      total: Number,
      used: Number,
      free: Number
    },
    disk: {
      total: Number,
      used: Number,
      free: Number
    },
    network: {
      bytesIn: Number,
      bytesOut: Number,
      connections: Number
    }
  },
  status: {
    type: String,
    enum: ['healthy', 'warning', 'critical'],
    default: 'healthy'
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

const scalingEventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['scale_up', 'scale_down', 'auto_scale']
  },
  service: {
    type: String,
    required: true
  },
  trigger: {
    type: String,
    required: true,
    enum: [
      'cpu_threshold',
      'memory_threshold',
      'request_count',
      'error_rate',
      'manual',
      'scheduled'
    ]
  },
  changes: {
    previousInstances: Number,
    newInstances: Number,
    resources: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const optimizationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'caching',
      'indexing',
      'query_optimization',
      'connection_pooling',
      'load_balancing',
      'auto_scaling'
    ]
  },
  target: {
    service: String,
    resource: String
  },
  conditions: [{
    metric: String,
    operator: {
      type: String,
      enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne']
    },
    value: Number,
    duration: Number
  }],
  actions: [{
    type: {
      type: String,
      enum: [
        'scale',
        'cache',
        'optimize',
        'alert',
        'custom'
      ]
    },
    parameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'testing'],
    default: 'testing'
  },
  priority: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
performanceMetricSchema.index({ type: 1, service: 1, timestamp: -1 });
performanceMetricSchema.index({ endpoint: 1, timestamp: -1 });
performanceMetricSchema.index({ tags: 1 });

resourceUsageSchema.index({ instanceId: 1, type: 1 });
resourceUsageSchema.index({ status: 1, timestamp: -1 });

scalingEventSchema.index({ service: 1, type: 1, createdAt: -1 });
scalingEventSchema.index({ status: 1 });

optimizationRuleSchema.index({ type: 1, status: 1 });
optimizationRuleSchema.index({ priority: -1 });

// Performans Metrik metodları
performanceMetricSchema.statics.getAverageByType = async function(type, period) {
  const startTime = new Date(Date.now() - period);
  
  return this.aggregate([
    {
      $match: {
        type,
        timestamp: { $gte: startTime }
      }
    },
    {
      $group: {
        _id: '$service',
        avgValue: { $avg: '$value' }
      }
    }
  ]);
};

// Resource Usage metodları
resourceUsageSchema.methods.updateStatus = function() {
  const metrics = this.metrics;
  
  if (metrics.cpu.usage > 90 || metrics.memory.used / metrics.memory.total > 0.9) {
    this.status = 'critical';
  } else if (metrics.cpu.usage > 70 || metrics.memory.used / metrics.memory.total > 0.7) {
    this.status = 'warning';
  } else {
    this.status = 'healthy';
  }
};

// Scaling Event metodları
scalingEventSchema.methods.complete = async function(success, metadata = {}) {
  this.status = success ? 'completed' : 'failed';
  this.metadata = { ...this.metadata, ...metadata };
  await this.save();
};

// Optimization Rule metodları
optimizationRuleSchema.methods.evaluate = function(metrics) {
  return this.conditions.every(condition => {
    const metric = metrics[condition.metric];
    if (!metric) return false;

    switch (condition.operator) {
      case 'gt': return metric > condition.value;
      case 'lt': return metric < condition.value;
      case 'gte': return metric >= condition.value;
      case 'lte': return metric <= condition.value;
      case 'eq': return metric === condition.value;
      case 'ne': return metric !== condition.value;
      default: return false;
    }
  });
};

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);
const ResourceUsage = mongoose.model('ResourceUsage', resourceUsageSchema);
const ScalingEvent = mongoose.model('ScalingEvent', scalingEventSchema);
const OptimizationRule = mongoose.model('OptimizationRule', optimizationRuleSchema);

export {
  PerformanceMetric,
  ResourceUsage,
  ScalingEvent,
  OptimizationRule
};
