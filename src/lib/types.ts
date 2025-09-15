// Global type definitions for the application

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  gender?: string;
  age?: number;
  ticketStatus?: string;
  campRole: string;
  dietaryRestrictions: string[];
  medicalConditions: string;
  allergies: string;
  canArriveEarly: boolean;
  arrivalDay?: string;
  agreesToStayTillSaturday: boolean;
  needsTransport: boolean;
  hasVehicle: boolean;
  vehicleDetails?: string;
  specialSkills: string[];
  previousBurns: number;
  giftParticipation?: string;
  acceptsCampFee: boolean;
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
