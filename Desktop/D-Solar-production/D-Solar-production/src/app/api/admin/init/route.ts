import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    // Create admin user with the default password "password"
    const passwordHash = Admin.hashPassword('password');
    
    const admin = await Admin.create({
      username: 'admin',
      passwordHash: passwordHash,
      name: 'Admin User',
      email: 'admin@dsolar.com'
    });

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      admin: {
        username: admin.username,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Failed to initialize admin:', error);
    return NextResponse.json(
      { error: 'Failed to initialize admin user' },
      { status: 500 }
    );
  }
} 