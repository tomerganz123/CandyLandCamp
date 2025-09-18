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

export type VolunteerShiftInput = z.infer<typeof volunteerShiftSchema>;
export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
