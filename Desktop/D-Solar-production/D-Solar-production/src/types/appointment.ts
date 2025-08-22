// Define the appointment status options for client-side use
export enum AppointmentStatus {
  PENDING_CUSTOMER = 'pending_customer',
  PENDING_ADMIN = 'pending_admin',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

// Define the appointment interface for client-side use
export interface Appointment {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message?: string;
  status: AppointmentStatus;
  confirmationToken?: string;
  confirmationExpires?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment form data interface
export interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  date: Date | null;
  time: string;
  message: string;
}

// Available time slot interface
export interface AvailableTimeSlot {
  time: string;
  available: boolean;
}

// Pagination interface
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
} 