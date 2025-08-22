import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FAQ from '@/models/FAQ';

// Helper function to check if the request is from an authenticated admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  // In a real implementation, you would check the session/cookie
  // For now, we'll use a simple authorization header check
  const authHeader = request.headers.get('authorization');
  // Simple check - in a real app use proper authentication
  return authHeader?.startsWith('Bearer ') === true;
}

// Get a specific FAQ by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid FAQ ID provided' },
        { status: 400 }
      );
    }

    await connectDB();
    const faq = await FAQ.findOne({ id });
    
    if (!faq) {
      return NextResponse.json(
        { error: `FAQ with ID "${id}" not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(faq);
  } catch (error) {
    console.error(`Error fetching FAQ:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ' },
      { status: 500 }
    );
  }
}

// Update a specific FAQ by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || !body.answer || !body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find and update the FAQ
    const updatedFAQ = await FAQ.findOneAndUpdate(
      { id },
      { $set: {
        question: body.question,
        answer: body.answer,
        keywords: body.keywords
      }},
      { new: true, runValidators: true }
    );
    
    if (!updatedFAQ) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedFAQ);
  } catch (error) {
    console.error(`Error updating FAQ:`, error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

// Delete a specific FAQ by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find and delete the FAQ
    const deletedFAQ = await FAQ.findOneAndDelete({ id });
    
    if (!deletedFAQ) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error(`Error deleting FAQ:`, error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
} 