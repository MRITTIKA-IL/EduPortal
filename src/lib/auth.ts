// src/lib/auth.ts
// Secure password hashing and JWT authentication helper
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'auth_token';

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: 'Student' | 'Admin' | 'Staff';
  studentId?: number;
  studentNumber?: string;
  name: string;
}

// Secret key retrieved from environment variables
function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  return new TextEncoder().encode(secret);
}

/**
 * Hash a plain text password using bcrypt with salt factor 10.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against stored hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a stateless JWT token with 7-day expiration using jose.
 */
export async function signToken(payload: AuthTokenPayload): Promise<string> {
  const secret = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verify a JWT token and extract the payload. Returns null if invalid or expired.
 */
export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Attach the secure HTTP-only authentication cookie to an outgoing response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

/**
 * Clear the authentication cookie to log out the user.
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Extract and verify authentication token from incoming request cookies.
 */
export async function getAuthUser(request: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<AuthTokenPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

