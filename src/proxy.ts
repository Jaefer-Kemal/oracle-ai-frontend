import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('oracle_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');

  // If trying to access admin and no token, redirect to login
  if (isAdminPage && !token) {
    const loginUrl = new URL('/login', request.url);
    // Remember where we wanted to go
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and hitting login page, go to admin
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Next.js 16 Proxy Matching Paths
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
