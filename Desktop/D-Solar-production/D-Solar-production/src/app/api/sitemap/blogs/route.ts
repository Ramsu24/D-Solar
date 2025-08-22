import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET - Get all blog posts for sitemap
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Only fetch necessary fields for sitemap
    const blogPosts = await Blog.find({}, 'slug updatedAt createdAt').sort({ createdAt: -1 });
    
    // Transform to the format needed for sitemap
    const transformedPosts = blogPosts.map(post => ({
      slug: post.slug,
      updatedAt: post.updatedAt || post.createdAt,
      createdAt: post.createdAt
    }));
    
    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 