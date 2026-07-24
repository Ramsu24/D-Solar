import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') ?? '';

  if (process.env.PAUSE_SITE === 'true') {
    return new NextResponse('Site temporarily unavailable', {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': '3600',
      },
    });
  }

  const isLikelyCrawler = /bot|crawler|spider|slurp|duckduckgo|bytespider|gptbot|chatgpt|claudebot|ahrefs|semrush|mj12bot|bingpreview|applebot/i.test(userAgent);

  if (isLikelyCrawler && (pathname.startsWith('/api/') || pathname.startsWith('/confirm-appointment/'))) {
    return new NextResponse('Blocked', {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const adminUsername = request.cookies.get('adminUsername')?.value;

    if (!adminUsername) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};