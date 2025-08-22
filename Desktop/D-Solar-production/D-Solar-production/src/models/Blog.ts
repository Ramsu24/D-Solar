import mongoose from 'mongoose';

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  shortDescription?: string;
  imageUrl: string;
  author?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new mongoose.Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  shortDescription: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  author: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Add indexes for better query performance
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

export default Blog; 