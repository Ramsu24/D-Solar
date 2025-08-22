import mongoose, { Schema, Document } from 'mongoose';

// Define the appointment status options
export enum AppointmentStatus {
  PENDING_CUSTOMER = 'pending_customer',
  PENDING_ADMIN = 'pending_admin',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

// Define the appointment document interface
export interface IAppointment extends Document {
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  message?: string;
  status: AppointmentStatus;
  confirmationToken?: string;
  confirmationExpires?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the appointment schema
const AppointmentSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'] 
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'] 
    },
    date: { 
      type: Date, 
      required: [true, 'Appointment date is required'] 
    },
    time: { 
      type: String, 
      required: [true, 'Appointment time is required'] 
    },
    message: { 
      type: String
    },
    status: { 
      type: String, 
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING_CUSTOMER
    },
    confirmationToken: { 
      type: String 
    },
    confirmationExpires: { 
      type: Date 
    },
    notes: { 
      type: String 
    }
  },
  { 
    timestamps: true 
  }
);

// Create and export the Appointment model
export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema); 