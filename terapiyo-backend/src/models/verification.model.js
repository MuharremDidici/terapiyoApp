import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['degree', 'license', 'certification', 'specialization', 'training'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  issuer: {
    name: {
      type: String,
      required: true
    },
    country: String,
    website: String,
    verificationUrl: String
  },
  identifier: {
    number: {
      type: String,
      required: true
    },
    issuedAt: {
      type: Date,
      required: true
    },
    expiresAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending'
  },
  verificationDetails: {
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    method: {
      type: String,
      enum: ['manual', 'api', 'blockchain']
    },
    notes: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['certificate', 'transcript', 'license', 'other'],
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  specialties: [{
    type: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const verificationRequestSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  certificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'in_review', 'approved', 'rejected'],
    default: 'draft'
  },
  reviewDetails: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: Date,
    completedAt: Date,
    decision: {
      status: {
        type: String,
        enum: ['approved', 'rejected']
      },
      reason: String,
      notes: String
    }
  },
  submissionDetails: {
    submittedAt: Date,
    completedAt: Date,
    lastUpdatedAt: Date
  },
  communicationHistory: [{
    type: {
      type: String,
      enum: ['message', 'status_change', 'document_request'],
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: [{
      fileUrl: String,
      mimeType: String,
      size: Number
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const verificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['degree', 'license', 'certification', 'specialization', 'training'],
    required: true
  },
  issuer: {
    name: {
      type: String,
      required: true
    },
    country: String,
    website: String,
    verificationUrl: String,
    apiConfig: {
      endpoint: String,
      method: String,
      headers: mongoose.Schema.Types.Mixed,
      parameters: mongoose.Schema.Types.Mixed
    }
  },
  requiredDocuments: [{
    type: {
      type: String,
      enum: ['certificate', 'transcript', 'license', 'other'],
      required: true
    },
    description: String,
    required: {
      type: Boolean,
      default: true
    },
    format: {
      mimeTypes: [String],
      maxSize: Number
    }
  }],
  validationRules: [{
    field: String,
    type: {
      type: String,
      enum: ['format', 'regex', 'date', 'custom'],
      required: true
    },
    pattern: String,
    message: String,
    required: {
      type: Boolean,
      default: true
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
certificateSchema.index({ therapist: 1, type: 1 });
certificateSchema.index({ 'identifier.number': 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ 'identifier.expiresAt': 1 });

verificationRequestSchema.index({ therapist: 1 });
verificationRequestSchema.index({ status: 1 });
verificationRequestSchema.index({ 'reviewDetails.assignedTo': 1 });

verificationTemplateSchema.index({ type: 1 });
verificationTemplateSchema.index({ 'issuer.name': 1 });

// Methods
certificateSchema.methods.isExpired = function() {
  if (!this.identifier.expiresAt) return false;
  return new Date() > this.identifier.expiresAt;
};

certificateSchema.methods.verify = async function(userId, method = 'manual', notes = '') {
  this.status = 'verified';
  this.verificationDetails = {
    verifiedAt: new Date(),
    verifiedBy: userId,
    method,
    notes
  };
  await this.save();
};

verificationRequestSchema.methods.submit = async function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft requests can be submitted');
  }

  this.status = 'submitted';
  this.submissionDetails.submittedAt = new Date();
  this.submissionDetails.lastUpdatedAt = new Date();
  await this.save();
};

verificationRequestSchema.methods.addMessage = async function(sender, message, attachments = []) {
  this.communicationHistory.push({
    type: 'message',
    sender,
    message,
    attachments
  });
  this.submissionDetails.lastUpdatedAt = new Date();
  await this.save();
};

// Statics
certificateSchema.statics.findExpiring = async function(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return this.find({
    status: 'verified',
    'identifier.expiresAt': {
      $exists: true,
      $ne: null,
      $lte: date
    }
  }).populate('therapist');
};

verificationRequestSchema.statics.findPending = async function() {
  return this.find({
    status: 'submitted',
    'reviewDetails.assignedTo': { $exists: false }
  }).populate('therapist');
};

const Certificate = mongoose.model('Certificate', certificateSchema);
const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
const VerificationTemplate = mongoose.model('VerificationTemplate', verificationTemplateSchema);

export { Certificate, VerificationRequest, VerificationTemplate };
