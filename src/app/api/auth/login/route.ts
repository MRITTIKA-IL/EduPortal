// src/app/api/auth/login/route.ts
// POST /api/auth/login — Authenticates a user and sets session cookie
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and password' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // 2. Query user and student profile
    const result = await pool
      .request()
      .input('email', email.toLowerCase().trim())
      .query(`
        SELECT 
          u.UserID,
          u.Email,
          u.PasswordHash,
          u.Role,
          u.IsActive,
          s.StudentID,
          s.StudentNumber,
          s.FirstName,
          s.LastName
        FROM Users u
        LEFT JOIN Students s ON u.UserID = s.UserID
        WHERE u.Email = @email
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.recordset[0];

    // 3. Check account active status
    if (!user.IsActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact administration.' },
        { status: 403 }
      );
    }

    // 4. Verify password
    const isPasswordValid = await verifyPassword(password, user.PasswordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 5. Update LastLoginAt timestamp asynchronously
    pool
      .request()
      .input('userId', user.UserID)
      .query('UPDATE Users SET LastLoginAt = GETDATE() WHERE UserID = @userId')
      .catch((err) => console.error('Failed to update LastLoginAt:', err));

    // 6. Sign JWT token
    const fullName = user.FirstName && user.LastName
      ? `${user.FirstName} ${user.LastName}`
      : user.Email.split('@')[0];

    const token = await signToken({
      userId: user.UserID,
      email: user.Email,
      role: user.Role,
      studentId: user.StudentID || undefined,
      studentNumber: user.StudentNumber || undefined,
      name: fullName,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          userId: user.UserID,
          email: user.Email,
          role: user.Role,
          studentNumber: user.StudentNumber,
          name: fullName,
        },
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
