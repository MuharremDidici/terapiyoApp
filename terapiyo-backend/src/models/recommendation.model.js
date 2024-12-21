import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categories: [{
    category: {
      type: String,
      enum: [
        'anxiety',
        'depression',
        'relationships',
        'stress',
        'trauma',
        'addiction',
        'family',
        'career',
        'personal_growth',
        'other'
      ]
    },
    weight: {
      type: Number,
      default: 1.0
    }
  }],
  specialties: [{
    specialty: String,
    weight: {
      type: Number,
      default: 1.0
    }
  }],
  therapistPreferences: {
    gender: String,
    ageRange: {
      min: Number,
      max: Number
    },
    experience: {
      type: String,
      enum: ['entry', 'intermediate', 'senior', 'expert']
    },
    language: [String],
    sessionType: {
      type: String,
      enum: ['video', 'voice', 'chat', 'in_person']
    },
    availability: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'weekend']
    }
  },
  sessionHistory: [{
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    feedback: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  interactionHistory: [{
    type: {
      type: String,
      enum: ['view_profile', 'book_session', 'cancel_session', 'complete_session', 'message']
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommendations: [{
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      required: true
    },
    factors: [{
      name: String,
      weight: Number,
      score: Number
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  filters: {
    categories: [String],
    specialties: [String],
    availability: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    radius: Number // in kilometers
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  algorithm: {
    type: String,
    enum: ['collaborative', 'content_based', 'hybrid'],
    default: 'hybrid'
  },
  metadata: {
    processingTime: Number,
    totalCandidates: Number,
    filteredCandidates: Number,
    version: String
  }
}, {
  timestamps: true
});

const contentSimilaritySchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentVector: {
    type: Map,
    of: Number
  },
  specialtyVector: {
    type: Map,
    of: Number
  },
  approachVector: {
    type: Map,
    of: Number
  },
  demographicVector: {
    type: Map,
    of: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const userSimilaritySchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  similarity: {
    type: Number,
    required: true
  },
  commonFactors: [{
    factor: String,
    weight: Number
  }],
  lastCalculated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const feedbackSchema = new mongoose.Schema({
  recommendation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recommendation',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'click', 'book', 'ignore'],
    required: true
  },
  position: Number,
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionOutcome: {
    booked: Boolean,
    completed: Boolean,
    rating: Number,
    feedback: String
  }
}, {
  timestamps: true
});

// Indexes
userPreferenceSchema.index({ user: 1 }, { unique: true });
userPreferenceSchema.index({ 'categories.category': 1 });
userPreferenceSchema.index({ 'specialties.specialty': 1 });

recommendationSchema.index({ user: 1 });
recommendationSchema.index({ 'recommendations.therapist': 1 });
recommendationSchema.index({ status: 1 });
recommendationSchema.index({ algorithm: 1 });

contentSimilaritySchema.index({ therapist: 1 }, { unique: true });
contentSimilaritySchema.index({ lastUpdated: 1 });

userSimilaritySchema.index({ user1: 1, user2: 1 }, { unique: true });
userSimilaritySchema.index({ similarity: -1 });
userSimilaritySchema.index({ lastCalculated: 1 });

feedbackSchema.index({ recommendation: 1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ therapist: 1 });
feedbackSchema.index({ action: 1 });
feedbackSchema.index({ timestamp: 1 });

// Models
const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
const Recommendation = mongoose.model('Recommendation', recommendationSchema);
const ContentSimilarity = mongoose.model('ContentSimilarity', contentSimilaritySchema);
const UserSimilarity = mongoose.model('UserSimilarity', userSimilaritySchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

export {
  UserPreference,
  Recommendation,
  ContentSimilarity,
  UserSimilarity,
  Feedback
};
