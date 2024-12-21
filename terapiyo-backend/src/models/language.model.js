import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: String,
    required: true
  },
  context: {
    type: String,
    enum: [
      'general',
      'auth',
      'profile',
      'appointment',
      'chat',
      'video',
      'payment',
      'notification',
      'error'
    ],
    default: 'general'
  },
  tags: [{
    type: String
  }],
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  defaultFallback: {
    type: String,
    default: 'en'
  },
  metadata: {
    icon: String,
    region: String,
    dateFormat: String,
    timeFormat: String,
    numberFormat: {
      decimal: String,
      thousand: String,
      precision: Number
    }
  }
}, {
  timestamps: true
});

const userLanguageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preferredLanguage: {
    type: String,
    required: true,
    default: 'tr'
  },
  fallbackLanguages: [{
    type: String
  }],
  autoDetect: {
    type: Boolean,
    default: true
  },
  metadata: {
    lastDetected: {
      type: Date
    },
    browserLanguage: String,
    deviceLanguage: String
  }
}, {
  timestamps: true
});

// Indexes
translationSchema.index({ key: 1, language: 1 }, { unique: true });
userLanguageSchema.index({ user: 1 }, { unique: true });

// Models
const Translation = mongoose.model('Translation', translationSchema);
const Language = mongoose.model('Language', languageSchema);
const UserLanguage = mongoose.model('UserLanguage', userLanguageSchema);

export {
  Translation,
  Language,
  UserLanguage
};
