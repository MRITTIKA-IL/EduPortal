// src/app/api/auth/register/route.ts
// POST /api/auth/register — Registers a new student account
import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, departmentId, password, confirmPassword } = body;

    // 1. Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // 2. Check for duplicate email
    const existingUser = await pool
      .request()
      .input('email', email.toLowerCase().trim())
      .query('SELECT UserID FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Create User and Student in SQL Server Transaction
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Insert User
      const userResult = await transaction
        .request()
        .input('email', email.toLowerCase().trim())
        .input('passwordHash', hashedPassword)
        .input('role', 'Student')
        .query(`
          INSERT INTO Users (Email, PasswordHash, Role, IsActive, CreatedAt)
          OUTPUT INSERTED.UserID
          VALUES (@email, @passwordHash, @role, 1, GETDATE())
        `);

      const userId: number = userResult.recordset[0].UserID;

      // Generate unique StudentNumber (e.g. STU2026-1042)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const studentNumber = `STU2026-${randomSuffix}`;

      // Insert Student
      const parsedDeptId = departmentId ? parseInt(String(departmentId), 10) : null;
      const studentResult = await transaction
        .request()
        .input('userId', userId)
        .input('studentNumber', studentNumber)
        .input('firstName', firstName.trim())
        .input('lastName', lastName.trim())
        .input('departmentId', parsedDeptId)
        .input('enrollmentYear', new Date().getFullYear())
        .query(`
          INSERT INTO Students (UserID, StudentNumber, FirstName, LastName, DepartmentID, EnrollmentYear, CreatedAt)
          OUTPUT INSERTED.StudentID
          VALUES (@userId, @studentNumber, @firstName, @lastName, @departmentId, @enrollmentYear, GETDATE())
        `);

      const studentId: number = studentResult.recordset[0].StudentID;

      await transaction.commit();

      // 5. Sign JWT and set cookie
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const token = await signToken({
        userId,
        email: email.toLowerCase().trim(),
        role: 'Student',
        studentId,
        studentNumber,
        name: fullName,
      });

      const response = NextResponse.json(
        {
          success: true,
          message: 'Registration successful',
          user: {
            userId,
            email: email.toLowerCase().trim(),
            role: 'Student',
            studentNumber,
            name: fullName,
          },
        },
        { status: 201 }
      );

      setAuthCookie(response, token);
      return response;
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
