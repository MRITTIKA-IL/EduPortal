// src/app/api/student/courses/route.ts
// GET /api/student/courses — List available courses with enrollment status for logged-in student
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester') || 'Fall 2026';
    const dept = searchParams.get('dept');

    const pool = await getPool();

    // 1. Resolve StudentID securely using logged-in UserID
    const studentQuery = await pool
      .request()
      .input('userId', authUser.userId)
      .query('SELECT StudentID FROM Students WHERE UserID = @userId');

    if (studentQuery.recordset.length === 0) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    const studentId: number = studentQuery.recordset[0].StudentID;

    let sql = `
      SELECT 
        c.CourseID,
        c.CourseCode,
        c.Title,
        c.Description,
        c.Credits,
        c.Level,
        d.Name AS DepartmentName,
        d.Code AS DepartmentCode,
        CASE WHEN e.EnrollmentID IS NOT NULL AND e.Status = 'Active' THEN 1 ELSE 0 END AS IsEnrolled,
        e.EnrollmentID,
        e.Status AS EnrollmentStatus
      FROM Courses c
      LEFT JOIN Departments d ON c.DepartmentID = d.DepartmentID
      LEFT JOIN Enrollments e ON c.CourseID = e.CourseID AND e.StudentID = @studentId AND e.Semester = @semester
      WHERE c.IsActive = 1
    `;

    const req = pool
      .request()
      .input('studentId', studentId)
      .input('semester', semester);

    if (dept && dept !== 'ALL') {
      sql += ' AND d.Code = @dept';
      req.input('dept', dept);
    }

    sql += ' ORDER BY d.Name, c.CourseCode';

    const result = await req.query(sql);

    return NextResponse.json(
      {
        success: true,
        semester,
        courses: result.recordset.map((row) => ({
          ...row,
          IsEnrolled: Boolean(row.IsEnrolled),
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Available Courses Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching available courses.' },
      { status: 500 }
    );
  }
}
