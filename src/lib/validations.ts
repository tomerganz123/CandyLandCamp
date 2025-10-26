import { z } from 'zod';

// Volunteer shift registration validation schema
export const volunteerShiftSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  campName: z.string().max(100, 'Camp name must be less than 100 characters').optional(),
  shiftType: z.enum(['gift', 'camp']),
  giftName: z.string().optional(),
  teamName: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  timeSlot: z.string().optional(),
  location: z.string().optional(),
}).refine((data) => {
  // Either giftName or teamName must be provided based on shiftType
  if (data.shiftType === 'gift') {
    return !!data.giftName;
  }
  if (data.shiftType === 'camp') {
    return !!data.teamName;
  }
  return true;
}, {
  message: "Gift name is required for gift shifts, team name is required for camp shifts"
});

// Validation schemas using Zod
export const memberRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  idNumber: z.string().min(1, 'ID or Passport number is required').max(20),
  gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say'], {
    errorMap: () => ({ message: 'Please select your gender' })
  }),
  age: z.number().min(18, 'Must be at least 18 years old').max(99, 'Please enter a valid age'),
  
  ticketStatus: z.enum([
    'Yes I bought via Camp',
    'Yes I bought via other Department',
    'No - but should get a ticket via other department',
    'No - no lead for a ticket at this stage'
  ], {
    errorMap: () => ({ message: 'Please select your ticket status' })
  }),
  
  campRole: z.enum([
    'Kitchen Manager', 
    'Build Team',
    'Art Team',
    'Safety Officer',
    'Shift Manager',
    'Suppliers Manager',
    'DJ/Music',
    'Other'
  ]),
  
  dietaryRestrictions: z.array(z.enum([
    'Vegetarian',
    'Vegan', 
    'Gluten-Free',
    'Halal',
    'Lactose Intolerant',
    'Other'
  ])).default([]),
  
  medicalConditions: z.string().default(''),
  allergies: z.string().default(''),
  
  canArriveEarly: z.boolean().default(false),
  arrivalDay: z.enum([
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday'
  ], {
    errorMap: () => ({ message: 'Please select your arrival day' })
  }),
  agreesToStayTillSaturday: z.boolean().refine((val) => val === true, {
    message: 'You must agree to stay till Saturday and help with camp packing'
  }),
  needsTransport: z.boolean().default(false),
  hasVehicle: z.boolean().default(false),
  vehicleDetails: z.string().optional(),
  
  specialSkills: z.array(z.string()).default([]),
  previousBurns: z.number().min(0).default(0),
  giftParticipation: z.enum([
    'קבאב הזמן',
    'סדנאות יוגה / מדיטציה במקפ',
    'מסיבה שקיעה בקמפ'
  ], {
    errorMap: () => ({ message: 'Please select which gift you would like to participate in' })
  }),
  acceptsCampFee: z.boolean().refine((val) => val === true, {
    message: 'You must accept the camp fee terms to register'
  }),
  comments: z.string().default(''),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const memberUpdateSchema = memberRegistrationSchema.partial().extend({
  isApproved: z.boolean().optional(),
});

// Budget expense validation schema
export const budgetExpenseSchema = z.object({
  costCategory: z.enum([
    'Food & Beverages',
    'Transportation',
    'Equipment & Supplies',
    'Art & Decorations',
    'Infrastructure',
    'Emergency/Medical',
    'Gift',
    'Other'
  ]),
  item: z.string().min(1, 'Item description is required').max(200, 'Item description must be less than 200 characters'),
  quantity: z.number().min(0, 'Quantity cannot be negative').default(1),
  costAmount: z.number().min(0, 'Cost amount cannot be negative'),
  alreadyPaid: z.boolean().default(false),
  whoPaid: z.string().optional(),
  whoPaidName: z.string().optional(),
  moneyReturned: z.boolean().default(false),
  dateOfExpense: z.string().or(z.date()).transform((val) => new Date(val)),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
}).refine((data) => {
  // If already paid, whoPaid must be provided
  if (data.alreadyPaid && !data.whoPaid) {
    return false;
  }
  return true;
}, {
  message: "Who paid is required when expense is marked as paid",
  path: ["whoPaid"]
});

// Fee payment validation schema
export const feePaymentSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  memberName: z.string().min(1, 'Member name is required'),
  memberEmail: z.string().email('Valid email is required'),
  memberPhone: z.string().min(1, 'Phone number is required'),
  firstPaymentPaid: z.boolean().default(false),
  firstPaymentDate: z.union([z.string(), z.date(), z.null()]).optional().transform((val) => {
    if (!val || val === null || val === '') return undefined;
    return new Date(val);
  }),
  firstPaymentNotes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  secondPaymentPaid: z.boolean().default(false),
  secondPaymentDate: z.union([z.string(), z.date(), z.null()]).optional().transform((val) => {
    if (!val || val === null || val === '') return undefined;
    return new Date(val);
  }),
  secondPaymentNotes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
  thirdPaymentPaid: z.boolean().default(false),
  thirdPaymentDate: z.union([z.string(), z.date(), z.null()]).optional().transform((val) => {
    if (!val || val === null || val === '') return undefined;
    return new Date(val);
  }),
  thirdPaymentNotes: z.string().max(200, 'Notes must be less than 200 characters').optional(),
});

// Additional member info validation schema
export const additionalInfoSchema = z.object({
  memberId: z.string().min(1, 'Please select yourself from the members list'),
  memberName: z.string().min(1, 'Member name is required'),
  memberEmail: z.string().email('Valid email is required'),
  
  arrivalWhen: z.enum([
    'מעוניין להגיע להקמות',
    'יום שני',
    'יום שלישי',
    'יום רביעי',
    'יום חמישי',
    'עוד לא בטוח'
  ], {
    errorMap: () => ({ message: 'Please select when you are coming' })
  }),
  
  bringingTent: z.boolean().default(false),
  sharingTent: z.boolean().default(false),
  sharingWithMemberId: z.string().optional(),
  sharingWithMemberName: z.string().optional(),
  tentSize: z.enum([
    'אוהל 2-3 אנשים',
    'אוהל 4 אנשים',
    'אוהל 6-8',
    'אחר'
  ]).optional(),
  
  drinksCoffee: z.boolean().default(false),
  milkPreference: z.enum([
    'ללא חלב',
    'חלב רגיל',
    'חלב שקדים',
    'חלב שיבולת',
    'אחר'
  ]).optional(),
  hasDietaryRestriction: z.boolean().default(false),
  dietaryRestrictionType: z.enum([
    'צמחוני',
    'טבעוני',
    'פירותני',
    'אחר'
  ]).optional(),
  
  wantsMattress: z.boolean().default(false),
  
  specialFoodRequests: z.string().optional(),
  
  comments: z.string().optional(),
}).refine((data) => {
  // If bringing tent is true, tent size is required
  if (data.bringingTent && !data.tentSize) {
    return false;
  }
  return true;
}, {
  message: "Tent size is required when bringing a tent",
  path: ["tentSize"]
}).refine((data) => {
  // If sharing tent is true, sharingWithMemberId must be provided
  if (data.sharingTent && !data.sharingWithMemberId) {
    return false;
  }
  return true;
}, {
  message: "Please select which member you are sharing a tent with",
  path: ["sharingWithMemberId"]
}).refine((data) => {
  // If drinks coffee is true, milk preference is required
  if (data.drinksCoffee && !data.milkPreference) {
    return false;
  }
  return true;
}, {
  message: "Please select your milk preference",
  path: ["milkPreference"]
}).refine((data) => {
  // If has dietary restriction is true, dietary restriction type is required
  if (data.hasDietaryRestriction && !data.dietaryRestrictionType) {
    return false;
  }
  return true;
}, {
  message: "Please select your dietary restriction type",
  path: ["dietaryRestrictionType"]
});

export type VolunteerShiftInput = z.infer<typeof volunteerShiftSchema>;
export type BudgetExpenseInput = z.infer<typeof budgetExpenseSchema>;
export type FeePaymentInput = z.infer<typeof feePaymentSchema>;
export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type AdditionalInfoInput = z.infer<typeof additionalInfoSchema>;
