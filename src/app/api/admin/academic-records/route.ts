
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

// GET /api/admin/academic-records — Fetch academic records for all students (Admin only)
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

    // 3. Fetch all students
    const studentsResult = await pool.request().query(`
      SELECT
        s.StudentID,
        s.StudentNumber,
        s.FirstName,
        s.LastName,
        s.GPA,
        s.EnrollmentYear,
        d.Name AS DepartmentName
      FROM Students s
      LEFT JOIN Departments d ON s.DepartmentID = d.DepartmentID
      ORDER BY s.StudentNumber ASC
    `);

    // 4. Fetch all subject records
    const recordsResult = await pool.request().query(`
      SELECT
        e.EnrollmentID,
        e.StudentID,
        e.Semester,
        e.Status,
        e.Grade,
        e.GradePoints,
        e.EnrolledAt,
        c.CourseID,
        c.CourseCode,
        c.Title AS SubjectName,
        c.Credits,
        c.Level,
        d.Name AS CourseDepartment
      FROM Enrollments e
      INNER JOIN Courses c ON e.CourseID = c.CourseID
      LEFT JOIN Departments d ON c.DepartmentID = d.DepartmentID
      ORDER BY e.StudentID, e.Semester DESC, c.CourseCode ASC
    `);

    // 5. Prepare academic records for each student
    const students = studentsResult.recordset.map((student) => {
      const studentRecords = recordsResult.recordset.filter(
        (record) => record.StudentID === student.StudentID
      );

      const subjects = studentRecords.map((record) => ({
        enrollmentId: record.EnrollmentID,
        courseId: record.CourseID,
        courseCode: record.CourseCode,
        subjectName: record.SubjectName,
        credits: record.Credits,
        level: record.Level,
        departmentName: record.CourseDepartment || '',
        semester: record.Semester,
        status: record.Status,
        grade: record.Grade || null,
        gradePoints:
          record.GradePoints !== null && record.GradePoints !== undefined
            ? Number(record.GradePoints)
            : null,
        enrolledAt: record.EnrolledAt,
        isGraded:
          record.GradePoints !== null && record.GradePoints !== undefined,
      }));

      // 6. Calculate GPA and credits
      let qualityPoints = 0;
      let gradedCredits = 0;
      let totalCreditsAttempted = 0;
      let totalCreditsEarned = 0;

      for (const subject of subjects) {
        if (subject.status !== 'Dropped') {
          totalCreditsAttempted += subject.credits;
        }

        if (
  subject.isGraded &&
  subject.gradePoints !== null &&
  subject.status === 'Completed'
) {
          qualityPoints += subject.credits * subject.gradePoints;
          gradedCredits += subject.credits;

          if (subject.gradePoints > 0) {
            totalCreditsEarned += subject.credits;
          }
        }
      }

      const calculatedGpa =
        gradedCredits > 0
          ? (qualityPoints / gradedCredits).toFixed(2)
          : student.GPA !== null && Number(student.GPA) > 0
            ? Number(student.GPA).toFixed(2)
            : null;

      return {
        studentId: student.StudentID,
        studentNumber: student.StudentNumber,
        name: `${student.FirstName} ${student.LastName}`.trim(),
        department: student.DepartmentName || '',
        enrollmentYear: student.EnrollmentYear,
        cumulativeGpa: calculatedGpa,
        totalCreditsAttempted,
        totalCreditsEarned,
        totalSubjects: subjects.length,
        gradedSubjects: subjects.filter((subject) => subject.isGraded).length,
        subjects,
      };
    });

    // 7. Return all academic records
    return NextResponse.json(
      {
        success: true,
        totalStudents: students.length,
        students,
      },
      { status: 200 }
    );

  }
  
   catch (error) {
    console.error('Admin Academic Records API Error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching academic records.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/academic-records — Update student grade and status (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (authUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { enrollmentId, grade, status } = body;

    if (!enrollmentId || !Number.isInteger(enrollmentId)) {
      return NextResponse.json(
        { error: 'Valid Enrollment ID is required.' },
        { status: 400 }
      );
    }

    const gradeScale: Record<string, number> = {
      O: 10,
      'A+': 9,
      A: 8,
      'B+': 7,
      B: 6,
      C: 5,
      F: 0,
    };

    if (!Object.prototype.hasOwnProperty.call(gradeScale, grade)) {
      return NextResponse.json(
        { error: 'Invalid grade selected.' },
        { status: 400 }
      );
    }

    if (!['Active', 'Completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid enrollment status.' },
        { status: 400 }
      );
    }

    const gradePoints = gradeScale[grade];

    const pool = await getPool();

    const result = await pool.request()
      .input('EnrollmentID', enrollmentId)
      .input('Grade', grade)
      .input('GradePoints', gradePoints)
      .input('Status', status)
      .query(`
        UPDATE Enrollments
        SET
          Grade = @Grade,
          GradePoints = @GradePoints,
          Status = @Status
        WHERE EnrollmentID = @EnrollmentID;

        SELECT @@ROWCOUNT AS UpdatedRows;
      `);

    if (result.recordset[0].UpdatedRows === 0) {
      return NextResponse.json(
        { error: 'Enrollment not found.' },
        { status: 404 }
      );
    }
    // Recalculate and update the student's GPA in the Students table
await pool.request()
  .input('EnrollmentID', enrollmentId)
  .query(`
    UPDATE Students
    SET GPA = (
      SELECT
        CAST(
          ROUND(
            SUM(CAST(c.Credits AS DECIMAL(18,2)) * e.GradePoints)
            /
            NULLIF(SUM(CAST(c.Credits AS DECIMAL(18,2))), 0),
            2
          ) AS DECIMAL(4,2)
        )
      FROM Enrollments e
      INNER JOIN Courses c
        ON e.CourseID = c.CourseID
      WHERE
        e.StudentID = Students.StudentID
        AND e.Status = 'Completed'
        AND e.GradePoints IS NOT NULL
    )
    WHERE StudentID = (
      SELECT StudentID
      FROM Enrollments
      WHERE EnrollmentID = @EnrollmentID
    );
  `);

    return NextResponse.json({
      success: true,
      message: 'Grade and status updated successfully.',
      grade,
      gradePoints,
      status,
    });

  } catch (error) {
    console.error('Update Academic Record Error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the grade.' },
      { status: 500 }
    );
  }
}

