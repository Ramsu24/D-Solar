import mongoose, { Model } from 'mongoose';

export interface IPackage {
  code: string;
  name: string;
  description: string;
  type: string; // 'ongrid', 'hybrid-small', 'hybrid-large'
  wattage: number;
  suitableFor: string;
  financingPrice: number;
  srpPrice: number;
  cashPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const packageSchema = new mongoose.Schema<IPackage>({
  code: {
    type: String,
    required: [true, 'Package code is required'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  type: {
    type: String,
    required: [true, 'Package type is required'],
    enum: ['ongrid', 'hybrid', 'hybrid-small', 'hybrid-large'],
  },
  wattage: {
    type: Number,
    required: [true, 'Wattage is required'],
  },
  suitableFor: {
    type: String,
    required: [true, 'Suitable for description is required'],
  },
  financingPrice: {
    type: Number,
    required: [true, 'Financing price is required'],
  },
  srpPrice: {
    type: Number,
    required: [true, 'SRP price is required'],
  },
  cashPrice: {
    type: Number,
    required: [true, 'Cash price is required'],
  }
}, {
  timestamps: true,
});

// Add indexes for better search performance
packageSchema.index({ type: 1 });

const Package = (mongoose.models.Package || mongoose.model<IPackage>('Package', packageSchema));

export default Package; 