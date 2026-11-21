
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

// GET /api/admin/enrollments — Fetch all student enrollments (Admin only)
export async function GET(request: NextRequest) {
  try {
    // 1. Verify logged-in user
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Allow only Admin
    if (authUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const pool = await getPool();

    // 3. Fetch all enrollments with student and course details
    const result = await pool.request().query(`
      SELECT
        e.EnrollmentID,
        e.StudentID,
        s.StudentNumber,
        s.FirstName,
        s.LastName,
        e.CourseID,
        c.CourseCode,
        c.Title AS CourseTitle,
        c.Credits,
        e.Semester,
        e.Status,
        e.Grade,
        e.GradePoints,
        e.EnrolledAt
      FROM Enrollments e
      INNER JOIN Students s ON e.StudentID = s.StudentID
      INNER JOIN Courses c ON e.CourseID = c.CourseID
      ORDER BY e.EnrolledAt DESC
    `);

    // 4. Return enrollment details
    return NextResponse.json(
      {
        success: true,
        total: result.recordset.length,
        enrollments: result.recordset,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin Enrollments API Error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching enrollments.' },
      { status: 500 }
    );
  }
}
