import { z } from 'zod';

// Validation schemas using Zod
export const memberRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  idNumber: z.string().min(1, 'ID or Passport number is required').max(20),
  
  ticketStatus: z.enum([
    'Yes I bought via Camp',
    'Yes I bought via other Department',
    'No - but should get a ticket via other department',
    'No - no lead for a ticket at this stage'
  ], {
    errorMap: () => ({ message: 'Please select your ticket status' })
  }),
  
  campRole: z.enum([
    'Camp Lead',
    'Kitchen Manager', 
    'Build Team',
    'Art Team',
    'Safety Officer',
    'Medic',
    'DJ/Music',
    'Photographer',
    'General Member',
    'Other'
  ]),
  
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Relationship is required'),
  }),
  
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
  arrivalDays: z.array(z.enum([
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday'
  ])).min(1, 'Please select at least one arrival day'),
  agreesToStayTillSaturday: z.boolean().refine((val) => val === true, {
    message: 'You must agree to stay till Saturday and help with camp packing'
  }),
  needsTransport: z.boolean().default(false),
  hasVehicle: z.boolean().default(false),
  vehicleDetails: z.string().optional(),
  
  specialSkills: z.array(z.string()).default([]),
  previousBurns: z.number().min(0).default(0),
  comments: z.string().default(''),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const memberUpdateSchema = memberRegistrationSchema.partial().extend({
  isApproved: z.boolean().optional(),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
