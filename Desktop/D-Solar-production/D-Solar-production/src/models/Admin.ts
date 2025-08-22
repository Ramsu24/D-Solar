import mongoose, { Model } from 'mongoose';
import crypto from 'crypto';

export interface IAdmin {
  username: string;
  passwordHash: string;
  name: string;
  email: string;
}

interface IAdminMethods {
  verifyPassword(password: string): boolean;
}

interface AdminModel extends Model<IAdmin, {}, IAdminMethods> {
  hashPassword(password: string): string;
}

const adminSchema = new mongoose.Schema<IAdmin, AdminModel, IAdminMethods>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

// Add method to verify password
adminSchema.method('verifyPassword', function(password: string): boolean {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return this.passwordHash === hash;
});

// Add static method to hash password
adminSchema.static('hashPassword', function(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
});

const Admin = (mongoose.models.Admin || mongoose.model<IAdmin, AdminModel>('Admin', adminSchema)) as AdminModel;

export default Admin; 