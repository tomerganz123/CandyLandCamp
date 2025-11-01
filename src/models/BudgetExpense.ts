import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment {
  _id?: string;
  amount: number;
  whoPaid: string; // Member ID
  whoPaidName: string; // Member name
  datePaid: Date;
  moneyReturned: boolean;
  notes?: string;
}

export interface IBudgetExpense extends Document {
  costCategory: string;
  item: string;
  quantity: number;
  costAmount: number; // Total amount in NIS
  
  // New payment structure - multiple payments per expense
  payments: IPayment[];
  
  // Legacy fields (kept for backward compatibility)
  alreadyPaid: boolean;
  whoPaid?: string; // Member ID who paid
  whoPaidName?: string; // Member name for easier queries
  moneyReturned: boolean;
  
  dateOfExpense: Date;
  notes?: string; // Optional notes field
  createdAt: Date;
  updatedAt: Date;
  
  // Computed properties
  totalPaid: number;
  remainingAmount: number;
}

const PaymentSchema = new Schema<IPayment>({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount cannot be negative']
  },
  whoPaid: {
    type: String,
    required: true,
    trim: true
  },
  whoPaidName: {
    type: String,
    required: true,
    trim: true
  },
  datePaid: {
    type: Date,
    required: true,
    default: Date.now
  },
  moneyReturned: {
    type: Boolean,
    required: true,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Payment notes must be less than 200 characters']
  }
}, { _id: true });

const BudgetExpenseSchema = new Schema<IBudgetExpense>({
  costCategory: {
    type: String,
    required: true,
    enum: [
      'Food & Beverages',
      'Transportation',
      'Equipment & Supplies',
      'Art & Decorations',
      'Infrastructure',
      'Emergency/Medical',
      'Gift',
      'Other'
    ],
    trim: true
  },
  item: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Item description must be less than 200 characters']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  costAmount: {
    type: Number,
    required: true,
    min: [0, 'Cost amount cannot be negative']
  },
  // New payments array
  payments: {
    type: [PaymentSchema],
    default: []
  },
  // Legacy fields (kept for backward compatibility with existing data)
  alreadyPaid: {
    type: Boolean,
    default: false
  },
  whoPaid: {
    type: String,
    trim: true
  },
  whoPaidName: {
    type: String,
    trim: true
  },
  moneyReturned: {
    type: Boolean,
    default: false
  },
  dateOfExpense: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes must be less than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties for calculated fields
BudgetExpenseSchema.virtual('totalPaid').get(function(this: IBudgetExpense) {
  if (this.payments && this.payments.length > 0) {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }
  // Legacy: if using old structure
  return this.alreadyPaid ? this.costAmount : 0;
});

BudgetExpenseSchema.virtual('remainingAmount').get(function(this: IBudgetExpense) {
  return this.costAmount - (this.totalPaid || 0);
});

// Pre-save hook to migrate legacy data to new payments structure
BudgetExpenseSchema.pre('save', function(next) {
  // If this is existing data with legacy structure, migrate it
  if (this.alreadyPaid && this.whoPaid && (!this.payments || this.payments.length === 0)) {
    this.payments = [{
      amount: this.costAmount,
      whoPaid: this.whoPaid,
      whoPaidName: this.whoPaidName || 'Unknown',
      datePaid: this.dateOfExpense,
      moneyReturned: this.moneyReturned,
      notes: 'Migrated from legacy data'
    }];
  }
  next();
});

// Indexes for better query performance
BudgetExpenseSchema.index({ costCategory: 1 });
BudgetExpenseSchema.index({ alreadyPaid: 1 });
BudgetExpenseSchema.index({ moneyReturned: 1 });
BudgetExpenseSchema.index({ dateOfExpense: -1 });
BudgetExpenseSchema.index({ whoPaid: 1 });
BudgetExpenseSchema.index({ 'payments.whoPaid': 1 });
BudgetExpenseSchema.index({ createdAt: -1 });

// Compound index for common queries
BudgetExpenseSchema.index({ costCategory: 1, alreadyPaid: 1 });

export default mongoose.models.BudgetExpense || mongoose.model<IBudgetExpense>('BudgetExpense', BudgetExpenseSchema);
