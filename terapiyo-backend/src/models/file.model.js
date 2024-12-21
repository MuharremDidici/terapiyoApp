import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  bucket: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['profile', 'message', 'document', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'active', 'deleted'],
    default: 'processing'
  },
  metadata: {
    width: Number,
    height: Number,
    duration: Number,
    format: String,
    pages: Number
  },
  security: {
    isPublic: {
      type: Boolean,
      default: false
    },
    accessControl: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['read', 'write', 'admin'],
        default: 'read'
      }
    }],
    expiresAt: Date,
    password: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  virus: {
    scanned: {
      type: Boolean,
      default: false
    },
    clean: {
      type: Boolean,
      default: false
    },
    scannedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
fileSchema.index({ owner: 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ 'security.isPublic': 1 });

// Virtual for signed URL
fileSchema.virtual('signedUrl').get(function() {
  // This will be implemented in the service layer
  return null;
});

// Methods
fileSchema.methods.generateSignedUrl = async function(expiresIn = 3600) {
  // This will be implemented in the service layer
  return null;
};

fileSchema.methods.markAsActive = async function() {
  this.status = 'active';
  await this.save();
};

fileSchema.methods.softDelete = async function() {
  this.status = 'deleted';
  await this.save();
};

fileSchema.methods.hasAccess = function(userId, requiredPermission = 'read') {
  if (this.owner.toString() === userId.toString()) return true;
  if (this.security.isPublic && requiredPermission === 'read') return true;

  const access = this.security.accessControl.find(
    ac => ac.user.toString() === userId.toString()
  );

  if (!access) return false;

  const permissions = {
    read: ['read', 'write', 'admin'],
    write: ['write', 'admin'],
    admin: ['admin']
  };

  return permissions[requiredPermission].includes(access.permission);
};

// Statics
fileSchema.statics.getStorageUsage = async function(userId) {
  const result = await this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId), status: 'active' } },
    { $group: { _id: null, total: { $sum: '$size' } } }
  ]);
  return result[0]?.total || 0;
};

const File = mongoose.model('File', fileSchema);

export default File;
