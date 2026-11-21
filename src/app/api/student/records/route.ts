
// src/app/api/student/records/route.ts
// GET /api/student/records — Fetch academic records for the authenticated student

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

export interface SubjectRecord {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  subjectName: string;
  credits: number;
  level: string;
  departmentName: string;
  departmentCode: string;
  semester: string;
  status: string;
  grade: string | null;
  gradePoints: number | null;
  marks: number | null;
  enrolledAt: string;
  isGraded: boolean;
}

export interface SemesterRecord {
  semester: string;
  semesterGpa: string | null;
  totalCredits: number;
  earnedCredits: number;
  subjects: SubjectRecord[];
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // 2. Allow only Student accounts
    if (authUser.role !== 'Student') {
      return NextResponse.json(
        { error: 'Access denied. Student only.' },
        { status: 403 }
      );
    }

    // 3. Get optional semester filter
    const { searchParams } = new URL(request.url);
    const semesterFilter = searchParams.get('semester');

    const pool = await getPool();

    // 4. Fetch student using authenticated UserID
    const studentQuery = await pool
      .request()
      .input('userId', authUser.userId)
      .query(`
        SELECT
          s.StudentID,
          s.StudentNumber,
          s.FirstName,
          s.LastName,
          s.GPA,
          s.EnrollmentYear,
          d.Name AS DepartmentName
        FROM Students s
        LEFT JOIN Departments d
          ON s.DepartmentID = d.DepartmentID
        WHERE s.UserID = @userId
      `);

    if (studentQuery.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Student record not found.' },
        { status: 404 }
      );
    }

    const student = studentQuery.recordset[0];
    const studentId: number = student.StudentID;

    // 5. Fetch enrolled subjects
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
        c.Title AS SubjectName,
        c.Credits,
        c.Level,
        d.Name AS DepartmentName,
        d.Code AS DepartmentCode
      FROM Enrollments e
      INNER JOIN Courses c
        ON e.CourseID = c.CourseID
      LEFT JOIN Departments d
        ON c.DepartmentID = d.DepartmentID
      WHERE e.StudentID = @studentId
    `;

    const req = pool.request().input('studentId', studentId);

    if (semesterFilter) {
      sql += ' AND e.Semester = @semester';
      req.input('semester', semesterFilter.trim());
    }

    sql += ' ORDER BY e.Semester DESC, c.CourseCode ASC';

    const result = await req.query(sql);

    // 6. Prepare subject records
    const subjects: SubjectRecord[] = result.recordset.map((r) => {
      const isGraded =
        r.GradePoints !== null && r.GradePoints !== undefined;

      return {
        enrollmentId: r.EnrollmentID,
        courseId: r.CourseID,
        courseCode: r.CourseCode,
        subjectName: r.SubjectName,
        credits: Number(r.Credits),
        level: r.Level,
        departmentName: r.DepartmentName || '',
        departmentCode: r.DepartmentCode || '',
        semester: r.Semester,
        status: r.Status,
        grade: r.Grade || null,
        gradePoints: isGraded ? Number(r.GradePoints) : null,
        marks: null,
        enrolledAt: r.EnrolledAt,
        isGraded,
      };
    });

    // 7. Group subjects by semester
    const semesterMap = new Map<string, SubjectRecord[]>();

    for (const subject of subjects) {
      const list = semesterMap.get(subject.semester) || [];
      list.push(subject);
      semesterMap.set(subject.semester, list);
    }

    const semesters: SemesterRecord[] = [];

    let overallQualityPoints = 0;
    let overallGradedCredits = 0;
    let totalCreditsAttempted = 0;
    let totalCreditsEarned = 0;

    // 8. Calculate semester GPA and credits
    for (const [semName, semSubjects] of semesterMap.entries()) {
      let semQualityPoints = 0;
      let semGradedCredits = 0;
      let semTotalCredits = 0;
      let semEarnedCredits = 0;

      for (const subject of semSubjects) {
        if (subject.status !== 'Dropped') {
          semTotalCredits += subject.credits;
          totalCreditsAttempted += subject.credits;
        }

        if (
          subject.isGraded &&
          subject.gradePoints !== null &&
          subject.status !== 'Dropped'
        ) {
          semQualityPoints +=
            subject.credits * subject.gradePoints;

          semGradedCredits += subject.credits;

          overallQualityPoints +=
            subject.credits * subject.gradePoints;

          overallGradedCredits += subject.credits;

          if (subject.gradePoints > 0) {
            semEarnedCredits += subject.credits;
            totalCreditsEarned += subject.credits;
          }
        }
      }

      const semesterGpa =
        semGradedCredits > 0
          ? (semQualityPoints / semGradedCredits).toFixed(2)
          : null;

      semesters.push({
        semester: semName,
        semesterGpa,
        totalCredits: semTotalCredits,
        earnedCredits: semEarnedCredits,
        subjects: semSubjects,
      });
    }

    // 9. Calculate cumulative GPA
    const calculatedCumulativeGpa =
      overallGradedCredits > 0
        ? (overallQualityPoints / overallGradedCredits).toFixed(2)
        : student.GPA !== null && Number(student.GPA) > 0
          ? Number(student.GPA).toFixed(2)
          : null;

    // 10. Return academic records
    return NextResponse.json(
      {
        success: true,
        student: {
          studentId: student.StudentID,
          studentNumber: student.StudentNumber,
          name: `${student.FirstName} ${student.LastName}`.trim(),
          department: student.DepartmentName || '',
          enrollmentYear: student.EnrollmentYear,
        },
        summary: {
          cumulativeGpa: calculatedCumulativeGpa,
          totalCreditsAttempted,
          totalCreditsEarned,
          totalSubjects: subjects.length,
          gradedSubjects: subjects.filter(
            (subject) => subject.isGraded
          ).length,
        },
        subjects,
        semesters,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Academic Records API Error:', error);

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while fetching academic records.',
      },
      { status: 500 }
    );
  }
}
