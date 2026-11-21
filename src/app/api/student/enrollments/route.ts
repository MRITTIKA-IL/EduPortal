// src/app/api/student/enrollments/route.ts
// GET /api/student/enrollments — List enrolled courses for the logged-in student
// POST /api/student/enrollments — Enroll logged-in student in a course
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const pool = await getPool();

    // 1. Resolve StudentID securely using logged-in UserID
    const studentQuery = await pool
      .request()
      .input('userId', authUser.userId)
      .query('SELECT StudentID, StudentNumber, FirstName, LastName FROM Students WHERE UserID = @userId');

    if (studentQuery.recordset.length === 0) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    const studentId: number = studentQuery.recordset[0].StudentID;

    // Optional semester filter from query params, or fetch all
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');

    let sql = `
      SELECT 
        e.EnrollmentID,
        e.Semester,
        e.Status,
        e.Grade,
        e.GradePoints,
        e.EnrolledAt,
        c.CourseID,
        c.CourseCode,
        c.Title,
        c.Description,
        c.Credits,
        c.Level,
        d.Name AS DepartmentName,
        d.Code AS DepartmentCode
      FROM Enrollments e
      INNER JOIN Courses c ON e.CourseID = c.CourseID
      LEFT JOIN Departments d ON c.DepartmentID = d.DepartmentID
      WHERE e.StudentID = @studentId
    `;

    const req = pool.request().input('studentId', studentId);

    if (semester) {
      sql += ' AND e.Semester = @semester';
      req.input('semester', semester);
    }

    sql += ' ORDER BY e.EnrolledAt DESC';

    const result = await req.query(sql);
    const enrollments = result.recordset;

    // Calculate total active credits
    const activeCredits = enrollments
      .filter((e) => e.Status === 'Active')
      .reduce((sum, e) => sum + (e.Credits || 0), 0);

    return NextResponse.json(
      {
        success: true,
        studentId,
        studentNumber: studentQuery.recordset[0].StudentNumber,
        enrollments,
        totalActiveCredits: activeCredits,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch Enrollments Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching enrollments.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, semester = 'Fall 2026' } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Please select a course to enroll.' },
        { status: 400 }
      );
    }

    const parsedCourseId = parseInt(String(courseId), 10);
    if (isNaN(parsedCourseId) || parsedCourseId <= 0) {
      return NextResponse.json({ error: 'Invalid Course ID.' }, { status: 400 });
    }

    const pool = await getPool();

    // 1. Resolve StudentID securely using logged-in UserID
    const studentQuery = await pool
      .request()
      .input('userId', authUser.userId)
      .query('SELECT StudentID FROM Students WHERE UserID = @userId');

    if (studentQuery.recordset.length === 0) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const studentId: number = studentQuery.recordset[0].StudentID;

    // 2. Validate course availability
    const courseQuery = await pool
      .request()
      .input('courseId', parsedCourseId)
      .query('SELECT CourseID, CourseCode, Title, Credits, IsActive FROM Courses WHERE CourseID = @courseId');

    if (courseQuery.recordset.length === 0) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const course = courseQuery.recordset[0];
    if (!course.IsActive) {
      return NextResponse.json(
        { error: `Course ${course.CourseCode} is currently inactive and not open for enrollment.` },
        { status: 400 }
      );
    }

    // 3. Prevent duplicate enrollment in the same semester
    const existingEnrollment = await pool
      .request()
      .input('studentId', studentId)
      .input('courseId', parsedCourseId)
      .input('semester', semester.trim())
      .query(`
        SELECT EnrollmentID, Status 
        FROM Enrollments 
        WHERE StudentID = @studentId AND CourseID = @courseId AND Semester = @semester
      `);

    if (existingEnrollment.recordset.length > 0) {
      const existing = existingEnrollment.recordset[0];
      if (existing.Status === 'Active') {
        return NextResponse.json(
          { error: `You are already enrolled in ${course.CourseCode} (${course.Title}) for ${semester}.` },
          { status: 409 }
        );
      }

      // If previously dropped, re-activate the enrollment
      if (existing.Status === 'Dropped') {
        await pool
          .request()
          .input('enrollmentId', existing.EnrollmentID)
          .query(`
            UPDATE Enrollments 
            SET Status = 'Active', EnrolledAt = GETDATE()
            WHERE EnrollmentID = @enrollmentId
          `);

        return NextResponse.json(
          {
            success: true,
            message: `Re-enrolled in ${course.CourseCode} (${course.Title}) for ${semester}.`,
            enrollmentId: existing.EnrollmentID,
            courseCode: course.CourseCode,
            title: course.Title,
            semester,
          },
          { status: 200 }
        );
      }
    }

    // 4. Insert new enrollment
    const insertResult = await pool
      .request()
      .input('studentId', studentId)
      .input('courseId', parsedCourseId)
      .input('semester', semester.trim())
      .query(`
        INSERT INTO Enrollments (StudentID, CourseID, Semester, Status, EnrolledAt)
        OUTPUT INSERTED.EnrollmentID, INSERTED.Semester, INSERTED.Status, INSERTED.EnrolledAt
        VALUES (@studentId, @courseId, @semester, 'Active', GETDATE())
      `);

    const newEnrollment = insertResult.recordset[0];

    return NextResponse.json(
      {
        success: true,
        message: `Successfully enrolled in ${course.CourseCode} (${course.Title})!`,
        enrollmentId: newEnrollment.EnrollmentID,
        courseCode: course.CourseCode,
        title: course.Title,
        credits: course.Credits,
        semester: newEnrollment.Semester,
        status: newEnrollment.Status,
        enrolledAt: newEnrollment.EnrolledAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Course Enrollment Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing enrollment.' },
      { status: 500 }
    );
  }
}
