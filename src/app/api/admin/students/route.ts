
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

// GET /api/admin/students
// Fetch all students — Admin only
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

    // 2. Verify Admin role
    if (authUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // 3. Connect to database
    const pool = await getPool();

    // 4. Fetch student records
    const result = await pool.request().query(`
      SELECT
        s.StudentID,
        s.StudentNumber,
        s.FirstName,
        s.LastName,
        u.UserID,
        u.Email,
        u.IsActive,
        s.Phone,
        s.Address,
        s.DateOfBirth,
        s.EnrollmentYear,
        s.GPA,
        s.DepartmentID,
        d.Name AS DepartmentName,
        d.Code AS DepartmentCode
      FROM Students s
      INNER JOIN Users u ON s.UserID = u.UserID
      LEFT JOIN Departments d ON s.DepartmentID = d.DepartmentID
      ORDER BY s.StudentID DESC
    `);

    // 5. Return student list
    const students = result.recordset.map((student) => ({
      studentId: student.StudentID,
      studentNumber: student.StudentNumber,
      userId: student.UserID,
      email: student.Email,
      isActive: student.IsActive,
      firstName: student.FirstName,
      lastName: student.LastName,
      fullName: `${student.FirstName} ${student.LastName}`.trim(),
      phone: student.Phone,
      address: student.Address,
      dateOfBirth: student.DateOfBirth,
      enrollmentYear: student.EnrollmentYear,
      gpa: student.GPA !== null
        ? Number(student.GPA).toFixed(2)
        : '0.00',
      departmentId: student.DepartmentID,
      departmentName: student.DepartmentName,
      departmentCode: student.DepartmentCode,
    }));

    return NextResponse.json({
      success: true,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error('Fetch Students Error:', error);

    return NextResponse.json(
      { error: 'Unable to fetch student records.' },
      { status: 500 }
    );
  }
}
// PUT /api/admin/students
// Update student profile — Admin only
export async function PUT(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authUser = await getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // 2. Verify Admin role
    if (authUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // 3. Read request data
    const body = await request.json();

    const {
      studentId,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      departmentId,
    } = body;

    if (!Number.isInteger(Number(studentId)) || Number(studentId) <= 0) {
      return NextResponse.json(
        { error: 'Valid student ID is required.' },
        { status: 400 }
      );
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'First name and last name are required.' },
        { status: 400 }
      );
    }

    // 4. Update student record
    const pool = await getPool();

    const result = await pool.request()
      .input('studentId', studentId)
      .input('firstName', firstName.trim())
      .input('lastName', lastName.trim())
      .input('phone', phone || null)
      .input('address', address || null)
      .input('dateOfBirth', dateOfBirth || null)
      .input('departmentId', departmentId || null)
      .query(`
        UPDATE Students
        SET
          FirstName = @firstName,
          LastName = @lastName,
          Phone = @phone,
          Address = @address,
          DateOfBirth = @dateOfBirth,
          DepartmentID = @departmentId
        WHERE StudentID = @studentId;

        SELECT @@ROWCOUNT AS affectedRows;
      `);

    if (result.recordset[0].affectedRows === 0) {
      return NextResponse.json(
        { error: 'Student not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully.',
    });

  } catch (error) {
    console.error('Update Student Error:', error);

    return NextResponse.json(
      { error: 'Unable to update student profile.' },
      { status: 500 }
    );
  }
}
