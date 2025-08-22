import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET - Retrieve a single blog post by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await props.params;
  try {
    await connectDB();
    const blog = await Blog.findById(params.id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Transform _id to id in the response
    const transformedBlog = {
      id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      shortDescription: blog.shortDescription,
      imageUrl: blog.imageUrl,
      author: blog.author,
      category: blog.category,
      tags: blog.tags,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    };

    return NextResponse.json(transformedBlog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing blog post
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await props.params;
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

    // Check if slug is being changed and if it's already taken
    if (data.slug) {
      const existingPost = await Blog.findOne({
        _id: { $ne: params.id },
        slug: data.slug
      });
      
      if (existingPost) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update the blog post
    const updatedPost = await Blog.findByIdAndUpdate(
      params.id,
      {
        title: data.title,
        slug: data.slug,
        content: data.content,
        shortDescription: data.shortDescription,
        imageUrl: data.imageUrl,
        author: data.author,
        category: data.category,
        tags: data.tags
      },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a blog post by ID
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await props.params;
  try {
    await connectDB();
    const deletedPost = await Blog.findByIdAndDelete(params.id);

    if (!deletedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}