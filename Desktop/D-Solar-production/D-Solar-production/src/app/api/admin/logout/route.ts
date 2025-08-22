import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear the auth cookie
    response.cookies.set({
      name: 'adminUsername',
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 