// Global type definitions for the application

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketStatus?: string;
  campRole: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  dietaryRestrictions: string[];
  medicalConditions: string;
  allergies: string;
  canArriveEarly: boolean;
  arrivalDays: string[];
  agreesToStayTillSaturday: boolean;
  needsTransport: boolean;
  hasVehicle: boolean;
  vehicleDetails?: string;
  specialSkills: string[];
  previousBurns: number;
  comments: string;
}

export interface AdminUser {
  id: string;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MemberStats {
  total: number;
  approved: number;
  pending: number;
  byRole: Record<string, number>;
  byDietary: Record<string, number>;
}
