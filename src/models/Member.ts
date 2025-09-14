import mongoose, { Document, Schema } from 'mongoose';

export interface IMember extends Document {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  
  // Ticket Information
  ticketStatus: string;
  
  // Camp Information
  campRole: string;
  
  // Dietary & Medical
  dietaryRestrictions: string[];
  medicalConditions: string;
  allergies: string;
  
  // Logistics
  canArriveEarly: boolean;
  arrivalDay: string;
  agreesToStayTillSaturday: boolean;
  needsTransport: boolean;
  hasVehicle: boolean;
  vehicleDetails?: string;
  
  // Additional
  specialSkills: string[];
  previousBurns: number;
  giftParticipation: string;
  acceptsCampFee: boolean;
  comments: string;
  
  // System fields
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  idNumber: { type: String, required: true, trim: true },
  
  ticketStatus: { 
    type: String, 
    required: true,
    enum: [
      'Yes I bought via Camp',
      'Yes I bought via other Department',
      'No - but should get a ticket via other department',
      'No - no lead for a ticket at this stage'
    ]
  },
  
  campRole: { 
    type: String, 
    required: true,
    enum: [
      'Kitchen Manager', 
      'Build Team',
      'Art Team',
      'Safety Officer',
      'Shift Manager',
      'Suppliers Manager',
      'DJ/Music',
      'Other'
    ]
  },
  
  dietaryRestrictions: [{
    type: String,
    enum: [
      'Vegetarian',
      'Vegan', 
      'Gluten-Free',
      'Halal',
      'Lactose Intolerant',
      'Other'
    ]
  }],
  
  medicalConditions: { type: String, default: '', trim: true },
  allergies: { type: String, default: '', trim: true },
  
  canArriveEarly: { type: Boolean, default: false },
  arrivalDay: {
    type: String,
    required: true,
    enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  agreesToStayTillSaturday: { type: Boolean, required: true },
  needsTransport: { type: Boolean, default: false },
  hasVehicle: { type: Boolean, default: false },
  vehicleDetails: { type: String, trim: true },
  
  specialSkills: [{ type: String, trim: true }],
  previousBurns: { type: Number, default: 0, min: 0 },
  giftParticipation: {
    type: String,
    required: true,
    enum: [
      'קבאב הזמן',
      'סדנאות יוגה / מדיטציה במקפ',
      'מסיבה שקיעה בקמפ'
    ]
  },
  acceptsCampFee: { type: Boolean, required: true },
  comments: { type: String, default: '', trim: true },
  
  isApproved: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes for better query performance
MemberSchema.index({ email: 1 });
MemberSchema.index({ campRole: 1 });
MemberSchema.index({ isApproved: 1 });
MemberSchema.index({ createdAt: -1 });

// Ensure we don't re-compile the model
export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
