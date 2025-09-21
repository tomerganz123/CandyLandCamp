import mongoose, { Document, Schema } from 'mongoose';

export interface IBudgetExpense extends Document {
  costCategory: string;
  item: string;
  quantity: number;
  costAmount: number; // Amount in NIS
  alreadyPaid: boolean;
  whoPaid?: string; // Member ID who paid
  whoPaidName?: string; // Member name for easier queries
  moneyReturned: boolean;
  dateOfExpense: Date;
  notes?: string; // Optional notes field
  createdAt: Date;
  updatedAt: Date;
}

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
  alreadyPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  whoPaid: {
    type: String,
    trim: true,
    required: function(this: IBudgetExpense) {
      return this.alreadyPaid;
    }
  },
  whoPaidName: {
    type: String,
    trim: true
  },
  moneyReturned: {
    type: Boolean,
    required: true,
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
  timestamps: true
});

// Indexes for better query performance
BudgetExpenseSchema.index({ costCategory: 1 });
BudgetExpenseSchema.index({ alreadyPaid: 1 });
BudgetExpenseSchema.index({ moneyReturned: 1 });
BudgetExpenseSchema.index({ dateOfExpense: -1 });
BudgetExpenseSchema.index({ whoPaid: 1 });
BudgetExpenseSchema.index({ createdAt: -1 });

// Compound index for common queries
BudgetExpenseSchema.index({ costCategory: 1, alreadyPaid: 1 });

export default mongoose.models.BudgetExpense || mongoose.model<IBudgetExpense>('BudgetExpense', BudgetExpenseSchema);
