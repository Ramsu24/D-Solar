import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const {searchParams} = new URL(request.url);
    const order = parseInt(searchParams.get('order') || '-1', 10);

    const blogPosts = await Blog.find().sort({ createdAt: order as 1 | -1});
    
    // Transform _id to id in the response
    const transformedPosts = blogPosts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      shortDescription: post.shortDescription,
      imageUrl: post.imageUrl,
      author: post.author,
      category: post.category,
      tags: post.tags,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
    return NextResponse.json(transformedPosts);
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Check if slug already exists
    const existingPost = await Blog.findOne({ slug: data.slug });
    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Create new post
    const newPost = await Blog.create({
      title: data.title,
      slug: data.slug,
      content: data.content,
      shortDescription: data.shortDescription,
      imageUrl: data.imageUrl || '/default-blog-image.jpg',
      author: data.author,
      category: data.category,
      tags: data.tags
    });
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 