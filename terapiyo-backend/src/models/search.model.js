import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    text: {
      type: String,
      required: true
    },
    filters: {
      specialties: [String],
      languages: [String],
      gender: String,
      sessionTypes: [String],
      priceRange: {
        min: Number,
        max: Number
      },
      availability: {
        days: [String],
        timeSlots: [String]
      },
      experience: {
        min: Number,
        max: Number
      },
      rating: Number
    }
  },
  results: {
    total: Number,
    therapists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  metadata: {
    platform: String,
    device: String,
    location: {
      city: String,
      country: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  interactions: [{
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['view', 'contact', 'book']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const popularSearchSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 1
  },
  category: {
    type: String,
    enum: ['specialty', 'problem', 'location', 'other']
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
});

const therapistIndexSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  searchScore: {
    type: Number,
    default: 0
  },
  specialtyWeights: {
    type: Map,
    of: Number
  },
  availability: {
    score: Number,
    nextAvailable: Date
  },
  performance: {
    rating: Number,
    reviewCount: Number,
    responseRate: Number,
    completionRate: Number
  },
  relevanceFactors: {
    experience: Number,
    certification: Number,
    activity: Number
  },
  keywords: [{
    text: String,
    weight: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Indexes
searchHistorySchema.index({ user: 1, createdAt: -1 });
searchHistorySchema.index({ 'query.text': 'text' });
searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

popularSearchSchema.index({ count: -1 });
popularSearchSchema.index({ category: 1, count: -1 });
popularSearchSchema.index({ lastSearched: 1 });

therapistIndexSchema.index({ searchScore: -1 });
therapistIndexSchema.index({ 'performance.rating': -1 });
therapistIndexSchema.index({ 'availability.nextAvailable': 1 });
therapistIndexSchema.index({ keywords: 'text' });

// Methods for SearchHistory
searchHistorySchema.methods.addInteraction = async function(therapistId, action) {
  this.interactions.push({
    therapist: therapistId,
    action
  });
  await this.save();
};

// Statics for PopularSearch
popularSearchSchema.statics.incrementSearch = async function(query, category) {
  const search = await this.findOne({ query });
  if (search) {
    search.count += 1;
    search.lastSearched = new Date();
    await search.save();
    return search;
  }

  return await this.create({
    query,
    category,
    lastSearched: new Date()
  });
};

popularSearchSchema.statics.getTopSearches = async function(category, limit = 10) {
  const query = category ? { category } : {};
  return await this.find(query)
    .sort({ count: -1 })
    .limit(limit);
};

// Methods for TherapistIndex
therapistIndexSchema.methods.updateSearchScore = async function() {
  const weights = {
    rating: 0.3,
    availability: 0.2,
    experience: 0.15,
    certification: 0.15,
    activity: 0.2
  };

  this.searchScore = 
    (this.performance.rating * weights.rating) +
    (this.availability.score * weights.availability) +
    (this.relevanceFactors.experience * weights.experience) +
    (this.relevanceFactors.certification * weights.certification) +
    (this.relevanceFactors.activity * weights.activity);

  this.lastUpdated = new Date();
  await this.save();
};

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
const PopularSearch = mongoose.model('PopularSearch', popularSearchSchema);
const TherapistIndex = mongoose.model('TherapistIndex', therapistIndexSchema);

export { SearchHistory, PopularSearch, TherapistIndex };
