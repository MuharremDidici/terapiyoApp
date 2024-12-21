import mongoose from 'mongoose';

const apiEndpointSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  },
  version: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  description: String,
  deprecated: {
    type: Boolean,
    default: false
  },
  parameters: [{
    name: String,
    in: {
      type: String,
      enum: ['path', 'query', 'header', 'body']
    },
    required: Boolean,
    type: String,
    description: String,
    schema: mongoose.Schema.Types.Mixed
  }],
  requestBody: {
    required: Boolean,
    content: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  responses: {
    type: Map,
    of: {
      description: String,
      content: mongoose.Schema.Types.Mixed
    }
  },
  security: [{
    type: Map,
    of: [String]
  }],
  tags: [String],
  examples: [{
    name: String,
    request: mongoose.Schema.Types.Mixed,
    response: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

const documentationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['api', 'guide', 'tutorial', 'reference']
  },
  category: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published'],
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  relatedDocs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Documentation'
  }]
}, {
  timestamps: true
});

const feedbackSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Documentation',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['helpful', 'issue', 'suggestion'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const changelogSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['major', 'minor', 'patch'],
    required: true
  },
  changes: [{
    type: {
      type: String,
      enum: ['added', 'changed', 'deprecated', 'removed', 'fixed', 'security'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    details: String,
    relatedDocs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Documentation'
    }]
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
apiEndpointSchema.index({ path: 1, method: 1, version: 1 }, { unique: true });
apiEndpointSchema.index({ tags: 1 });
apiEndpointSchema.index({ deprecated: 1 });

documentationSchema.index({ title: 1, version: 1 }, { unique: true });
documentationSchema.index({ category: 1, status: 1 });
documentationSchema.index({ tags: 1 });

feedbackSchema.index({ documentId: 1, type: 1 });
feedbackSchema.index({ status: 1 });

changelogSchema.index({ version: 1 }, { unique: true });
changelogSchema.index({ releaseDate: -1 });

// API Endpoint metodları
apiEndpointSchema.methods.deprecate = async function(newVersion) {
  this.deprecated = true;
  this.description = `Bu endpoint ${newVersion} sürümünde kullanımdan kaldırılacaktır. ` +
    (this.description || '');
  await this.save();
};

apiEndpointSchema.methods.addExample = async function(example) {
  this.examples.push(example);
  await this.save();
};

// Documentation metodları
documentationSchema.methods.publish = async function() {
  this.status = 'published';
  await this.save();
};

documentationSchema.methods.addReviewer = async function(userId) {
  if (!this.reviewers.includes(userId)) {
    this.reviewers.push(userId);
    await this.save();
  }
};

// Feedback metodları
feedbackSchema.methods.resolve = async function(resolution) {
  this.status = 'resolved';
  this.metadata = {
    ...this.metadata,
    resolution,
    resolvedAt: new Date()
  };
  await this.save();
};

// Changelog metodları
changelogSchema.methods.publish = async function() {
  this.status = 'published';
  await this.save();
};

changelogSchema.statics.getLatestVersion = async function() {
  return this.findOne({
    status: 'published'
  }).sort({ releaseDate: -1 });
};

const ApiEndpoint = mongoose.model('ApiEndpoint', apiEndpointSchema);
const Documentation = mongoose.model('Documentation', documentationSchema);
const DocumentationFeedback = mongoose.model('DocumentationFeedback', feedbackSchema);
const Changelog = mongoose.model('Changelog', changelogSchema);

export {
  ApiEndpoint,
  Documentation,
  DocumentationFeedback,
  Changelog
};
