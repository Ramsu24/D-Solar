import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    // Get the admin username from the cookie
    const adminUsername = request.cookies.get('adminUsername')?.value;

    if (!adminUsername) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Connect to database
    await connectDB();

    // Verify the admin exists
    const admin = await Admin.findOne({ username: adminUsername });
    
    if (!admin) {
      return NextResponse.json({ isAuthenticated: false });
    }

    return NextResponse.json({
      isAuthenticated: true,
      username: admin.username
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 