import mongoose, { Document, Schema } from 'mongoose';

export interface IFeePayment extends Document {
  memberId: string; // Reference to Member._id
  memberName: string; // Cached member name for easier queries
  memberEmail: string; // Cached member email
  memberPhone: string; // Cached member phone
  
  // Payment tracking
  firstPaymentPaid: boolean; // 750 NIS
  firstPaymentDate?: Date;
  firstPaymentNotes?: string;
  
  secondPaymentPaid: boolean; // 1250 NIS
  secondPaymentDate?: Date;
  secondPaymentNotes?: string;
  
  // Future payments (placeholders)
  thirdPaymentPaid: boolean;
  thirdPaymentDate?: Date;
  thirdPaymentNotes?: string;
  
  // Total tracking
  totalPaid: number; // Calculated total
  
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentSchema = new Schema<IFeePayment>({
  memberId: {
    type: String,
    required: true,
    unique: true, // One record per member
    trim: true
  },
  memberName: {
    type: String,
    required: true,
    trim: true
  },
  memberEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  memberPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  // First payment (750 NIS)
  firstPaymentPaid: {
    type: Boolean,
    default: false
  },
  firstPaymentDate: {
    type: Date
  },
  firstPaymentNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes must be less than 200 characters']
  },
  
  // Second payment (1250 NIS)
  secondPaymentPaid: {
    type: Boolean,
    default: false
  },
  secondPaymentDate: {
    type: Date
  },
  secondPaymentNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes must be less than 200 characters']
  },
  
  // Third payment (placeholder)
  thirdPaymentPaid: {
    type: Boolean,
    default: false
  },
  thirdPaymentDate: {
    type: Date
  },
  thirdPaymentNotes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes must be less than 200 characters']
  },
  
  // Total tracking
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate totalPaid before saving
FeePaymentSchema.pre('save', function(next) {
  let total = 0;
  if (this.firstPaymentPaid) total += 750;
  if (this.secondPaymentPaid) total += 1250;
  // Third payment amount TBD - for now 0
  if (this.thirdPaymentPaid) total += 0;
  
  this.totalPaid = total;
  next();
});

// Indexes for better query performance
FeePaymentSchema.index({ memberId: 1 }, { unique: true });
FeePaymentSchema.index({ memberName: 1 });
FeePaymentSchema.index({ firstPaymentPaid: 1 });
FeePaymentSchema.index({ secondPaymentPaid: 1 });
FeePaymentSchema.index({ totalPaid: 1 });
FeePaymentSchema.index({ createdAt: -1 });

export default mongoose.models.FeePayment || mongoose.model<IFeePayment>('FeePayment', FeePaymentSchema);
