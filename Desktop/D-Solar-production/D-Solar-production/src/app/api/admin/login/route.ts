import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectDB();
    
    // Find admin user
    const admin = await Admin.findOne({ username });
    console.log('Login attempt:', { username, adminFound: !!admin });
    
    if (!admin) {
      console.log('Admin not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = admin.verifyPassword(password);
    console.log('Password verification:', { isValid: isValidPassword });

    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Set cookie for authentication
    const response = NextResponse.json({
      success: true,
      user: {
        username: admin.username,
        name: admin.name,
        email: admin.email,
      }
    });
    
    // Add cookie to the response with enhanced security
    response.cookies.set({
      name: 'adminUsername',
      value: admin.username,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      ...(process.env.NEXT_PUBLIC_DOMAIN && {
        domain: process.env.NEXT_PUBLIC_DOMAIN
      })
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 