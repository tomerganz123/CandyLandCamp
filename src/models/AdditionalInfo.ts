import mongoose, { Document, Schema } from 'mongoose';

export interface IAdditionalInfo extends Document {
  memberId: string; // ID of the member from the original member collection
  memberName: string;
  memberEmail: string;
  
  // When are you coming
  arrivalWhen: string;
  
  // Tent information
  bringingTent: boolean;
  sharingTent: boolean;
  sharingWithMemberId?: string;
  sharingWithMemberName?: string;
  tentSize?: string;
  
  // Coffee/Food preferences
  drinksCoffee: boolean;
  milkPreference?: string;
  hasDietaryRestriction: boolean;
  dietaryRestrictionType?: string;
  
  // Mattress
  wantsMattress: boolean;
  
  // Comments
  specialFoodRequests?: string;
  comments?: string;
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
}

const AdditionalInfoSchema = new Schema<IAdditionalInfo>({
  memberId: { type: String, required: true, index: true },
  memberName: { type: String, required: true, trim: true },
  memberEmail: { type: String, required: true, trim: true },
  
  arrivalWhen: {
    type: String,
    required: true,
    enum: [
      'מעוניין להגיע להקמות',
      'יום שני',
      'יום שלישי',
      'יום רביעי',
      'יום חמישי',
      'עוד לא בטוח'
    ]
  },
  
  bringingTent: { type: Boolean, default: false },
  sharingTent: { type: Boolean, default: false },
  sharingWithMemberId: { type: String, trim: true },
  sharingWithMemberName: { type: String, trim: true },
  tentSize: {
    type: String,
    enum: [
      'אוהל 2-3 אנשים',
      'אוהל 4 אנשים',
      'אוהל 6-8',
      'אחר'
    ]
  },
  
  drinksCoffee: { type: Boolean, default: false },
  milkPreference: {
    type: String,
    enum: [
      'ללא חלב',
      'חלב רגיל',
      'חלב שקדים',
      'חלב שיבולת',
      'אחר'
    ]
  },
  hasDietaryRestriction: { type: Boolean, default: false },
  dietaryRestrictionType: {
    type: String,
    enum: [
      'צמחוני',
      'טבעוני',
      'פירותני',
      'אחר'
    ]
  },
  
  wantsMattress: { type: Boolean, default: false },
  
  specialFoodRequests: { type: String, trim: true },
  
  comments: { type: String, trim: true },
}, {
  timestamps: true,
});

// Ensure member can only submit once
AdditionalInfoSchema.index({ memberId: 1 }, { unique: true });

// Ensure we don't re-compile the model
export default mongoose.models.AdditionalInfo || mongoose.model<IAdditionalInfo>('AdditionalInfo', AdditionalInfoSchema);
