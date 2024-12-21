import mongoose from 'mongoose';

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 5
  },
  name: {
    type: String,
    required: true
  },
  nativeName: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['ltr', 'rtl'],
    default: 'ltr'
  },
  active: {
    type: Boolean,
    default: true
  },
  default: {
    type: Boolean,
    default: false
  },
  fallback: {
    type: String,
    ref: 'LocalizationLanguage'
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const translationKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['web', 'mobile', 'all'],
    default: 'all'
  },
  type: {
    type: String,
    enum: ['text', 'html', 'array', 'object'],
    default: 'text'
  },
  maxLength: Number,
  variables: [{
    name: String,
    description: String,
    example: String
  }],
  tags: [String],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const translationSchema = new mongoose.Schema({
  key: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TranslationKey',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published'],
    default: 'draft'
  },
  translator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    value: mongoose.Schema.Types.Mixed,
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: Date,
    comment: String
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const contentSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['page', 'email', 'notification', 'document', 'custom'],
    required: true
  },
  title: {
    type: Map,
    of: String,
    required: true
  },
  content: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Endeks tanımlamaları
languageSchema.index({ active: 1 });
languageSchema.index({ default: 1 });

translationKeySchema.index({ category: 1 });
translationKeySchema.index({ platform: 1 });
translationKeySchema.index({ tags: 1 });

translationSchema.index({ key: 1, language: 1 }, { unique: true });
translationSchema.index({ status: 1 });
translationSchema.index({ language: 1, status: 1 });

contentSchema.index({ type: 1, status: 1 });

// Language metodları
languageSchema.methods.setAsDefault = async function() {
  // Mevcut varsayılan dili sıfırla
  await this.constructor.findOneAndUpdate(
    { default: true },
    { default: false }
  );

  // Bu dili varsayılan yap
  this.default = true;
  await this.save();
};

languageSchema.methods.activate = async function() {
  this.active = true;
  await this.save();
};

languageSchema.methods.deactivate = async function() {
  if (this.default) {
    throw new Error('Varsayılan dil devre dışı bırakılamaz');
  }
  this.active = false;
  await this.save();
};

// TranslationKey metodları
translationKeySchema.methods.addVariable = async function(variable) {
  this.variables.push(variable);
  await this.save();
};

// Translation metodları
translationSchema.methods.approve = async function(userId) {
  this.status = 'approved';
  this.reviewer = userId;
  await this.save();
};

translationSchema.methods.publish = async function() {
  if (this.status !== 'approved') {
    throw new Error('Onaylanmamış çeviri yayınlanamaz');
  }
  this.status = 'published';
  await this.save();
};

translationSchema.methods.updateValue = async function(value, userId, comment) {
  // Mevcut değeri geçmişe kaydet
  this.history.push({
    value: this.value,
    status: this.status,
    updatedBy: userId,
    updatedAt: new Date(),
    comment
  });

  // Yeni değeri ayarla
  this.value = value;
  this.status = 'draft';
  this.version++;
  await this.save();
};

// Content metodları
contentSchema.methods.publish = async function() {
  this.status = 'published';
  await this.save();
};

contentSchema.methods.createNewVersion = async function() {
  const newContent = new Content({
    ...this.toObject(),
    _id: undefined,
    version: this.version + 1,
    status: 'draft'
  });
  await newContent.save();
  return newContent;
};

const Language = mongoose.model('LocalizationLanguage', languageSchema);
const TranslationKey = mongoose.model('TranslationKey', translationKeySchema);
const Translation = mongoose.model('LocalizationTranslation', translationSchema);
const Content = mongoose.model('Content', contentSchema);

export {
  Language as LocalizationLanguage,
  TranslationKey,
  Translation as LocalizationTranslation,
  Content
};
