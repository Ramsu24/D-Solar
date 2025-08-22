import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Check if the pathname starts with /admin
  if (pathname.startsWith('/admin')) {
    // Exclude the login page from authentication checks
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check if the user is authenticated
    const adminUsername = request.cookies.get('adminUsername')?.value;

    // If not authenticated, redirect to the login page
    if (!adminUsername) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}; 