
// src/middleware.ts
// Route protection for Student Portal and Admin Portal

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE_NAME = 'auth_token';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let userPayload: { role?: string; email?: string } | null = null;

  if (token) {
    try {
      const secret = getSecretKey();
      const { payload } = await jwtVerify(token, secret);
      userPayload = payload as { role?: string; email?: string };
    } catch {
      userPayload = null;
    }
  }

  const isAuthenticated = !!userPayload;
  const isAdmin = userPayload?.role === 'Admin';

  // 1. Admin login page is public
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', request.url)
      );
    }

    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from Student Login/Register
  if (
    isAuthenticated &&
    (pathname === '/student/login' || pathname === '/student/register')
  ) {
    return NextResponse.redirect(
      new URL(isAdmin ? '/admin/dashboard' : '/student/dashboard', request.url)
    );
  }

  // 3. Protect Student Dashboard
  if (pathname.startsWith('/student/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/student/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // 4. Protect all Admin routes
  if (pathname.startsWith('/admin/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/dashboard/:path*',
    '/student/login',
    '/student/register',
    '/admin/:path*',
  ],
};
