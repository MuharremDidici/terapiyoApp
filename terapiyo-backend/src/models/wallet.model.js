import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  reference: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const withdrawalMethodSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['bank_account', 'credit_card'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  details: {
    bankName: String,
    accountNumber: String,
    iban: String,
    cardNumber: String,
    cardHolderName: String
  }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['TRY', 'USD', 'EUR'],
    default: 'TRY'
  },
  transactions: [transactionSchema],
  withdrawalMethods: [withdrawalMethodSchema],
  withdrawalLimit: {
    daily: {
      type: Number,
      default: 10000
    },
    monthly: {
      type: Number,
      default: 50000
    }
  },
  lastWithdrawal: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
walletSchema.index({ user: 1 }, { unique: true });
walletSchema.index({ 'transactions.createdAt': -1 });

// Methods
walletSchema.methods.credit = function(amount, description, reference) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  this.balance += amount;
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    reference
  });

  return this.save();
};

walletSchema.methods.debit = function(amount, description, reference) {
  if (amount <= 0) {
    throw new Error('Debit amount must be positive');
  }

  if (this.balance < amount) {
    throw new Error('Insufficient balance');
  }

  this.balance -= amount;
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    reference
  });

  return this.save();
};

walletSchema.methods.addWithdrawalMethod = function(method) {
  if (this.withdrawalMethods.length === 0) {
    method.isDefault = true;
  }
  this.withdrawalMethods.push(method);
  return this.save();
};

walletSchema.methods.setDefaultWithdrawalMethod = function(methodId) {
  this.withdrawalMethods.forEach(method => {
    method.isDefault = method._id.equals(methodId);
  });
  return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
