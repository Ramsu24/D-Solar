import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package, { IPackage } from '@/models/Package';

// Helper function to check if the request is from an authenticated admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  // In a real implementation, you would check the session/cookie
  // For now, we'll use a simple authorization header check
  const authHeader = request.headers.get('authorization');
  // Simple check - in a real app use proper authentication
  return authHeader?.startsWith('Bearer ') === true;
}

// Get all packages
export async function GET() {
  try {
    await connectDB();
    const packages = await Package.find({}).sort({ type: 1, wattage: 1 });
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}

// Create a new package
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
    const requiredFields = ['code', 'name', 'description', 'type', 'wattage', 'suitableFor', 'financingPrice', 'srpPrice', 'cashPrice'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if package with the same code already exists
    const existingPackage = await Package.findOne({ code: body.code });
    if (existingPackage) {
      return NextResponse.json(
        { error: 'Package with this code already exists' },
        { status: 409 }
      );
    }

    const newPackage = await Package.create(body);
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    );
  }
} 