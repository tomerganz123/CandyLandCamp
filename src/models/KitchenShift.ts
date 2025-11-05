import mongoose, { Document, Schema } from 'mongoose';

export interface IKitchenShift extends Document {
  memberId: string; // Reference to Member
  memberName: string;
  memberEmail: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  shiftTime: 'morning' | 'evening';
  role: 'manager' | 'volunteer';
  registeredAt: Date;
}

const KitchenShiftSchema = new Schema<IKitchenShift>({
  memberId: { 
    type: String, 
    required: true,
    trim: true
  },
  memberName: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, 'Name must be less than 100 characters']
  },
  memberEmail: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  shiftTime: { 
    type: String, 
    required: true,
    enum: ['morning', 'evening']
  },
  role: { 
    type: String, 
    required: true,
    enum: ['manager', 'volunteer']
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Unique index - one member can only register for one shift total
KitchenShiftSchema.index({ 
  memberId: 1
}, { 
  unique: true
});

// Index for queries
KitchenShiftSchema.index({ day: 1, shiftTime: 1 });
KitchenShiftSchema.index({ role: 1 });
KitchenShiftSchema.index({ registeredAt: -1 });

export default mongoose.models.KitchenShift || mongoose.model<IKitchenShift>('KitchenShift', KitchenShiftSchema);

