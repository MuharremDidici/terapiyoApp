import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  type: {
    type: String,
    enum: ['appointment', 'payment', 'review', 'report', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  trigger: {
    event: {
      type: String,
      required: true
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan', 'in', 'notIn']
      },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  steps: [{
    name: String,
    type: {
      type: String,
      enum: [
        'notification',
        'email',
        'sms',
        'webhook',
        'function',
        'delay',
        'condition',
        'parallel',
        'approval'
      ],
      required: true
    },
    config: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true
    },
    retryConfig: {
      maxAttempts: {
        type: Number,
        default: 3
      },
      backoffMultiplier: {
        type: Number,
        default: 2
      },
      initialDelay: {
        type: Number,
        default: 1000 // milisaniye
      }
    },
    timeout: {
      type: Number,
      default: 30000 // milisaniye
    },
    errorHandling: {
      continueOnError: {
        type: Boolean,
        default: false
      },
      fallbackAction: {
        type: String,
        enum: ['skip', 'retry', 'fail', 'alternate'],
        default: 'fail'
      }
    }
  }],
  variables: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'object', 'array']
      },
      defaultValue: mongoose.Schema.Types.Mixed,
      required: Boolean
    }
  },
  timeout: {
    duration: {
      type: Number,
      default: 3600000 // 1 saat
    },
    action: {
      type: String,
      enum: ['fail', 'complete', 'callback'],
      default: 'fail'
    }
  },
  version: {
    type: Number,
    default: 1
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const workflowInstanceSchema = new mongoose.Schema({
  workflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  trigger: {
    event: String,
    data: mongoose.Schema.Types.Mixed
  },
  context: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  currentStep: {
    index: Number,
    startTime: Date,
    retryCount: {
      type: Number,
      default: 0
    }
  },
  steps: [{
    name: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'skipped']
    },
    startTime: Date,
    endTime: Date,
    error: {
      code: String,
      message: String,
      stack: String
    },
    output: mongoose.Schema.Types.Mixed
  }],
  variables: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  error: {
    code: String,
    message: String,
    stack: String,
    step: Number
  },
  startTime: Date,
  endTime: Date,
  duration: Number
}, {
  timestamps: true
});

const approvalTaskSchema = new mongoose.Schema({
  instance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowInstance',
    required: true
  },
  step: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['single', 'multiple', 'percentage'],
    required: true
  },
  approvers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comment: String,
    timestamp: Date
  }],
  requiredApprovals: {
    type: Number,
    required: function() {
      return this.type === 'multiple';
    }
  },
  requiredPercentage: {
    type: Number,
    required: function() {
      return this.type === 'percentage';
    },
    min: 0,
    max: 100
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
workflowSchema.index({ type: 1, status: 1 });
workflowSchema.index({ 'trigger.event': 1 });

workflowInstanceSchema.index({ workflow: 1, status: 1 });
workflowInstanceSchema.index({ startTime: 1 });
workflowInstanceSchema.index({ 'trigger.event': 1 });

approvalTaskSchema.index({ instance: 1, step: 1 });
approvalTaskSchema.index({ status: 1 });
approvalTaskSchema.index({ deadline: 1 });

// Workflow metodları
workflowSchema.methods.activate = async function() {
  this.status = 'active';
  await this.save();
};

workflowSchema.methods.deactivate = async function() {
  this.status = 'inactive';
  await this.save();
};

workflowSchema.methods.createNewVersion = async function() {
  const newWorkflow = new Workflow(this.toObject());
  newWorkflow.version = this.version + 1;
  newWorkflow.status = 'draft';
  await newWorkflow.save();
  return newWorkflow;
};

// WorkflowInstance metodları
workflowInstanceSchema.methods.start = async function() {
  this.status = 'running';
  this.startTime = new Date();
  this.currentStep = { index: 0, startTime: new Date() };
  await this.save();
};

workflowInstanceSchema.methods.complete = async function() {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  await this.save();
};

workflowInstanceSchema.methods.fail = async function(error, stepIndex) {
  this.status = 'failed';
  this.endTime = new Date();
  this.duration = this.endTime - this.startTime;
  this.error = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack,
    step: stepIndex
  };
  await this.save();
};

// ApprovalTask metodları
approvalTaskSchema.methods.approve = async function(userId, comment) {
  const approver = this.approvers.find(a => a.user.equals(userId));
  if (approver) {
    approver.status = 'approved';
    approver.comment = comment;
    approver.timestamp = new Date();
  }

  // Onay durumunu kontrol et
  await this.checkApprovalStatus();
  await this.save();
};

approvalTaskSchema.methods.reject = async function(userId, comment) {
  const approver = this.approvers.find(a => a.user.equals(userId));
  if (approver) {
    approver.status = 'rejected';
    approver.comment = comment;
    approver.timestamp = new Date();
  }

  this.status = 'rejected';
  await this.save();
};

approvalTaskSchema.methods.checkApprovalStatus = async function() {
  const approvedCount = this.approvers.filter(a => a.status === 'approved').length;
  const totalCount = this.approvers.length;

  switch (this.type) {
    case 'single':
      if (approvedCount > 0) {
        this.status = 'approved';
      }
      break;

    case 'multiple':
      if (approvedCount >= this.requiredApprovals) {
        this.status = 'approved';
      }
      break;

    case 'percentage':
      const percentage = (approvedCount / totalCount) * 100;
      if (percentage >= this.requiredPercentage) {
        this.status = 'approved';
      }
      break;
  }
};

const Workflow = mongoose.model('Workflow', workflowSchema);
const WorkflowInstance = mongoose.model('WorkflowInstance', workflowInstanceSchema);
const ApprovalTask = mongoose.model('ApprovalTask', approvalTaskSchema);

export {
  Workflow,
  WorkflowInstance,
  ApprovalTask
};
