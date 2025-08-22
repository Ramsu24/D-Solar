import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FAQ, { IFAQ } from '@/models/FAQ';

// Helper function to check if the request is from an authenticated admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  // TODO: Replace this with proper authentication using NextAuth.js or similar
  // This is just a placeholder and should NOT be used in production
  
  // IMPORTANT: Implement a secure authentication mechanism here
  // Options:
  // 1. Use NextAuth.js with a secure session mechanism
  // 2. Implement JWT validation
  // 3. Verify against an admin users collection in MongoDB
  
  // For development purposes only - REPLACE THIS IN PRODUCTION
  const authHeader = request.headers.get('authorization');
  // Simple check - DO NOT USE THIS IN PRODUCTION
  return authHeader?.startsWith('Bearer admin-token') === true;
}

// Get all FAQs
export async function GET() {
  try {
    await connectDB();
    const faqs = await FAQ.find({}).sort({ id: 1 });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// Create a new FAQ
export async function POST(request: NextRequest) {
  try {
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
    if (!body.id || !body.question || !body.answer || !body.keywords || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if FAQ with the same ID already exists
    const existingFAQ = await FAQ.findOne({ id: body.id });
    if (existingFAQ) {
      return NextResponse.json(
        { error: 'FAQ with this ID already exists' },
        { status: 409 }
      );
    }

    const newFAQ = await FAQ.create(body);
    return NextResponse.json(newFAQ, { status: 201 });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
} 