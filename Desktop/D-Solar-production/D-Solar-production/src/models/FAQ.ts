import mongoose, { Model } from 'mongoose';

export interface IFAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const faqSchema = new mongoose.Schema<IFAQ>({
  id: {
    type: String,
    required: [true, 'ID is required'],
    unique: true,
    trim: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
  },
  keywords: {
    type: [String],
    required: [true, 'At least one keyword is required'],
    validate: {
      validator: function(v: string[]) {
        return v.length > 0;
      },
      message: 'At least one keyword is required'
    }
  }
}, {
  timestamps: true,
});

// Add index for better search performance
faqSchema.index({ keywords: 1 });
faqSchema.index({ question: 'text' });

const FAQ = (mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', faqSchema));

export default FAQ; 