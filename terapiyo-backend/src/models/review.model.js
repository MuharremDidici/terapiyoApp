import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    expertise: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  comment: {
    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    language: {
      type: String,
      default: 'tr'
    },
    moderated: {
      type: Boolean,
      default: false
    },
    moderatedAt: Date,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'offensive', 'other']
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reply: {
    text: {
      type: String,
      maxlength: 500
    },
    createdAt: Date,
    moderated: {
      type: Boolean,
      default: false
    },
    moderatedAt: Date,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  metadata: {
    platform: String,
    device: String,
    sessionDuration: Number,
    sessionType: String
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ therapist: 1 });
reviewSchema.index({ client: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ 'rating.overall': -1 });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const { overall, expertise, communication, professionalism } = this.rating;
  return (overall + expertise + communication + professionalism) / 4;
});

// Methods
reviewSchema.methods.approve = async function(moderatorId) {
  this.status = 'approved';
  this.comment.moderated = true;
  this.comment.moderatedAt = new Date();
  this.comment.moderatedBy = moderatorId;
  await this.save();
};

reviewSchema.methods.reject = async function(moderatorId) {
  this.status = 'rejected';
  this.comment.moderated = true;
  this.comment.moderatedAt = new Date();
  this.comment.moderatedBy = moderatorId;
  await this.save();
};

reviewSchema.methods.hide = async function() {
  this.status = 'hidden';
  await this.save();
};

reviewSchema.methods.addFlag = async function(userId, reason, description) {
  this.flags.push({
    user: userId,
    reason,
    description
  });
  await this.save();
};

reviewSchema.methods.markHelpful = async function(userId) {
  const exists = this.helpful.some(h => h.user.toString() === userId.toString());
  if (!exists) {
    this.helpful.push({ user: userId });
    await this.save();
  }
};

reviewSchema.methods.addReply = async function(text) {
  this.reply = {
    text,
    createdAt: new Date()
  };
  await this.save();
};

// Statics
reviewSchema.statics.getTherapistStats = async function(therapistId) {
  const stats = await this.aggregate([
    {
      $match: {
        therapist: mongoose.Types.ObjectId(therapistId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageOverall: { $avg: '$rating.overall' },
        averageExpertise: { $avg: '$rating.expertise' },
        averageCommunication: { $avg: '$rating.communication' },
        averageProfessionalism: { $avg: '$rating.professionalism' },
        ratings: {
          $push: {
            overall: '$rating.overall',
            expertise: '$rating.expertise',
            communication: '$rating.communication',
            professionalism: '$rating.professionalism'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalReviews: 0,
    averageOverall: 0,
    averageExpertise: 0,
    averageCommunication: 0,
    averageProfessionalism: 0,
    ratings: []
  };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
