import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SolarCalculatorParams from '@/models/SolarCalculatorParams';

export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Find the calculator parameters
    const params = await SolarCalculatorParams.findOne();

    // If no parameters exist, return a 404 error
    if (!params) {
      return NextResponse.json(
        { error: 'Calculator parameters not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(params);
  } catch (error) {
    console.error('Error retrieving calculator parameters:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve calculator parameters' },
      { status: 500 }
    );
  }
} 