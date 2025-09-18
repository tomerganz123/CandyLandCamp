import mongoose, { Document, Schema } from 'mongoose';

export interface IVolunteerShift extends Document {
  name: string; // Volunteer's name
  email: string;
  campName?: string; // Optional camp name they're associated with
  shiftType: 'gift' | 'camp'; // Whether it's a gift shift or camp team
  giftName?: string; // For gift shifts (e.g., "קבאב הזמן")
  teamName?: string; // For camp team shifts (e.g., "Art Team")
  role: string; // Specific role (e.g., "Prep cook", "DJ", etc.)
  timeSlot?: string; // Optional time slot info
  location?: string; // Optional location info
  registeredAt: Date;
}

const VolunteerShiftSchema = new Schema<IVolunteerShift>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, 'Name must be less than 100 characters']
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  campName: { 
    type: String, 
    trim: true,
    maxlength: [100, 'Camp name must be less than 100 characters']
  },
  shiftType: { 
    type: String, 
    required: true,
    enum: ['gift', 'camp']
  },
  giftName: { 
    type: String, 
    trim: true,
    required: function(this: IVolunteerShift) { 
      return this.shiftType === 'gift'; 
    }
  },
  teamName: { 
    type: String, 
    trim: true,
    required: function(this: IVolunteerShift) { 
      return this.shiftType === 'camp'; 
    }
  },
  role: { 
    type: String, 
    required: true, 
    trim: true 
  },
  timeSlot: { 
    type: String, 
    trim: true 
  },
  location: { 
    type: String, 
    trim: true 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations for the same shift
VolunteerShiftSchema.index({ 
  email: 1, 
  shiftType: 1, 
  giftName: 1, 
  teamName: 1, 
  role: 1 
}, { 
  unique: true,
  partialFilterExpression: {
    $or: [
      { giftName: { $exists: true } },
      { teamName: { $exists: true } }
    ]
  }
});

// Additional indexes for queries
VolunteerShiftSchema.index({ name: 1 });
VolunteerShiftSchema.index({ campName: 1 });

// Index for queries
VolunteerShiftSchema.index({ registeredAt: -1 });
VolunteerShiftSchema.index({ shiftType: 1 });

export default mongoose.models.VolunteerShift || mongoose.model<IVolunteerShift>('VolunteerShift', VolunteerShiftSchema);
