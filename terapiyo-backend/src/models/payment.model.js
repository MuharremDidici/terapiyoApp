import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['TRY', 'USD', 'EUR'],
    default: 'TRY'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'bank_transfer']
  },
  description: {
    type: String,
    required: false
  },
  refund: {
    amount: Number,
    reason: String,
    date: Date
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

// Methods
paymentSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.updatedAt = new Date();
  return this.save();
};

paymentSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.errorMessage = error;
  this.updatedAt = new Date();
  return this.save();
};

paymentSchema.methods.initiateRefund = function(amount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Only completed payments can be refunded');
  }
  this.status = 'refunded';
  this.refund = {
    amount: amount || this.amount,
    reason,
    date: new Date()
  };
  this.updatedAt = new Date();
  return this.save();
};

// Virtuals
paymentSchema.virtual('isRefundable').get(function() {
  return this.status === 'completed' && !this.refund;
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
