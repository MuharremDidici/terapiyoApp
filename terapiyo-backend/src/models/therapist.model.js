import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialties: [{
    type: String,
    required: true,
    enum: [
      'Klinik Psikoloji',
      'Çift Terapisi',
      'Aile Terapisi',
      'Çocuk ve Ergen',
      'Depresyon',
      'Anksiyete',
      'Travma',
      'Bağımlılık',
      'Cinsel Terapi',
      'Yeme Bozuklukları'
    ]
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      enum: ['Lisans', 'Yüksek Lisans', 'Doktora']
    },
    field: {
      type: String,
      required: true
    },
    school: {
      type: String,
      required: true
    },
    graduationYear: {
      type: Number,
      required: true
    }
  }],
  experience: [{
    title: {
      type: String,
      required: true
    },
    organization: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: {
      type: String,
      required: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    credentialId: String
  }],
  about: {
    type: String,
    required: true,
    minlength: [100, 'About section must be at least 100 characters long']
  },
  languages: [{
    type: String,
    required: true
  }],
  sessionTypes: [{
    type: {
      type: String,
      enum: ['video', 'chat', 'voice'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    duration: {
      type: Number,
      required: true,
      enum: [30, 45, 60] // minutes
    }
  }],
  availability: {
    timezone: {
      type: String,
      default: 'Europe/Istanbul'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        startTime: String, // Format: "HH:mm"
        endTime: String    // Format: "HH:mm"
      }]
    }]
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      required: true,
      enum: ['diploma', 'certificate', 'identity', 'other']
    },
    url: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
therapistSchema.index({ 'specialties': 1 });
therapistSchema.index({ 'status': 1 });
therapistSchema.index({ 'rating.average': -1 });

// Virtual for full name
therapistSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for reviews
therapistSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'therapist'
});

// Virtual for appointments
therapistSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'therapist'
});

const Therapist = mongoose.model('Therapist', therapistSchema);

export default Therapist;
