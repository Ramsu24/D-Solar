import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';

// Helper function to check if the request is from an authenticated admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  // In a real implementation, you would check the session/cookie
  // For now, we'll use a simple authorization header check
  const authHeader = request.headers.get('authorization');
  // Simple check - in a real app use proper authentication
  return authHeader?.startsWith('Bearer ') === true;
}

// Get a specific package by code
export async function GET(
  _request: NextRequest, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    await connectDB();
    const packageItem = await Package.findOne({ code });
    
    if (!packageItem) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(packageItem);
  } catch (error) {
    console.error(`Error fetching package:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch package' },
      { status: 500 }
    );
  }
}

// Update a specific package by code
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
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
    const requiredFields = ['name', 'description', 'type', 'wattage', 'suitableFor', 'financingPrice', 'srpPrice', 'cashPrice'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Find and update the package
    const updatedPackage = await Package.findOneAndUpdate(
      { code },
      { $set: {
        name: body.name,
        description: body.description,
        type: body.type,
        wattage: body.wattage,
        suitableFor: body.suitableFor,
        financingPrice: body.financingPrice,
        srpPrice: body.srpPrice,
        cashPrice: body.cashPrice
      }},
      { new: true, runValidators: true }
    );
    
    if (!updatedPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error(`Error updating package:`, error);
    return NextResponse.json(
      { error: 'Failed to update package' },
      { status: 500 }
    );
  }
}

// Delete a specific package by code
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // Check authentication
    if (!await isAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Find and delete the package
    const deletedPackage = await Package.findOneAndDelete({ code });
    
    if (!deletedPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    console.error(`Error deleting package:`, error);
    return NextResponse.json(
      { error: 'Failed to delete package' },
      { status: 500 }
    );
  }
} 