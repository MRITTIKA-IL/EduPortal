// src/app/api/auth/me/route.ts
// GET /api/auth/me — Returns the currently authenticated user session
import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifyToken } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Verify user is still active in database
    const pool = await getPool();
    const result = await pool
      .request()
      .input('userId', payload.userId)
      .query(`
        SELECT 
          u.UserID,
          u.Email,
          u.Role,
          u.IsActive,
          s.StudentID,
          s.StudentNumber,
          s.FirstName,
          s.LastName,
          s.GPA,
          s.EnrollmentYear,
          d.Name AS DepartmentName,
          d.Code AS DepartmentCode
        FROM Users u
        LEFT JOIN Students s ON u.UserID = s.UserID
        LEFT JOIN Departments d ON s.DepartmentID = d.DepartmentID
        WHERE u.UserID = @userId
      `);

    if (result.recordset.length === 0 || !result.recordset[0].IsActive) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const row = result.recordset[0];
    const fullName = row.FirstName && row.LastName ? `${row.FirstName} ${row.LastName}` : payload.name;

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          userId: row.UserID,
          email: row.Email,
          role: row.Role,
          studentId: row.StudentID,
          studentNumber: row.StudentNumber,
          name: fullName,
          firstName: row.FirstName,
          lastName: row.LastName,
          gpa: row.GPA,
          enrollmentYear: row.EnrollmentYear,
          department: row.DepartmentName,
          departmentCode: row.DepartmentCode,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth Me Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
