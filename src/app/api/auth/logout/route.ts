// src/app/api/auth/logout/route.ts
// POST /api/auth/logout — Clears the authentication session cookie
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  clearAuthCookie(response);
  return response;
}
