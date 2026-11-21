// src/app/api/student/enrollments/drop/route.ts
// POST /api/student/enrollments/drop — Allows a logged-in student to drop an active course
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required.' }, { status: 400 });
    }

    const parsedEnrollmentId = parseInt(String(enrollmentId), 10);
    if (isNaN(parsedEnrollmentId)) {
      return NextResponse.json({ error: 'Invalid Enrollment ID.' }, { status: 400 });
    }

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

    // 2. Verify that the enrollment belongs to THIS student and is currently active
    const enrollmentQuery = await pool
      .request()
      .input('enrollmentId', parsedEnrollmentId)
      .input('studentId', studentId)
      .query(`
        SELECT e.EnrollmentID, e.Status, c.CourseCode, c.Title
        FROM Enrollments e
        INNER JOIN Courses c ON e.CourseID = c.CourseID
        WHERE e.EnrollmentID = @enrollmentId AND e.StudentID = @studentId
      `);

    if (enrollmentQuery.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Enrollment record not found or does not belong to your account.' },
        { status: 404 }
      );
    }

    const enrollment = enrollmentQuery.recordset[0];
    if (enrollment.Status === 'Dropped') {
      return NextResponse.json(
        { error: `You have already dropped ${enrollment.CourseCode} (${enrollment.Title}).` },
        { status: 400 }
      );
    }

    // 3. Update status to 'Dropped'
    await pool
      .request()
      .input('enrollmentId', parsedEnrollmentId)
      .query("UPDATE Enrollments SET Status = 'Dropped' WHERE EnrollmentID = @enrollmentId");

    return NextResponse.json(
      {
        success: true,
        message: `Successfully dropped ${enrollment.CourseCode} (${enrollment.Title}).`,
        enrollmentId: parsedEnrollmentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Drop Course Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while dropping the course.' },
      { status: 500 }
    );
  }
}
