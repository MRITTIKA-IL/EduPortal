// src/app/api/student/profile/route.ts
// GET /api/student/profile — Fetch the logged-in student's full profile
// PUT /api/student/profile — Update the logged-in student's editable profile info
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

    // Query student profile strictly scoped to the authenticated UserID
    const result = await pool
      .request()
      .input('userId', authUser.userId)
      .query(`
        SELECT 
          s.StudentID,
          s.StudentNumber,
          s.FirstName,
          s.LastName,
          CONVERT(VARCHAR(10), s.DateOfBirth, 120) AS DateOfBirth,
          s.Phone,
          s.Address,
          s.DepartmentID,
          s.EnrollmentYear,
          s.GPA,
          s.ProfileImageURL,
          s.CreatedAt,
          u.UserID,
          u.Email,
          u.Role,
          u.LastLoginAt,
          d.Name AS DepartmentName,
          d.Code AS DepartmentCode
        FROM Students s
        INNER JOIN Users u ON s.UserID = u.UserID
        LEFT JOIN Departments d ON s.DepartmentID = d.DepartmentID
        WHERE u.UserID = @userId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const profile = result.recordset[0];

    return NextResponse.json(
      {
        success: true,
        profile: {
          studentId: profile.StudentID,
          studentNumber: profile.StudentNumber,
          userId: profile.UserID,
          email: profile.Email,
          role: profile.Role,
          firstName: profile.FirstName,
          lastName: profile.LastName,
          fullName: `${profile.FirstName} ${profile.LastName}`.trim(),
          dateOfBirth: profile.DateOfBirth,
          phone: profile.Phone,
          address: profile.Address,
          departmentId: profile.DepartmentID,
          departmentName: profile.DepartmentName,
          departmentCode: profile.DepartmentCode,
          enrollmentYear: profile.EnrollmentYear,
          gpa: profile.GPA !== null ? Number(profile.GPA).toFixed(2) : '0.00',
          profileImageUrl: profile.ProfileImageURL,
          createdAt: profile.CreatedAt,
          lastLoginAt: profile.LastLoginAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the profile.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }
        // Only Admin users can update student profiles
    if (authUser.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only administrators can update student profiles.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, phone, address, dateOfBirth, departmentId, profileImageUrl } = body;

    // 1. Validations
    if (firstName !== undefined && (typeof firstName !== 'string' || !firstName.trim() || firstName.trim().length > 50)) {
      return NextResponse.json(
        { error: 'First name must be between 1 and 50 characters.' },
        { status: 400 }
      );
    }

    if (lastName !== undefined && (typeof lastName !== 'string' || !lastName.trim() || lastName.trim().length > 50)) {
      return NextResponse.json(
        { error: 'Last name must be between 1 and 50 characters.' },
        { status: 400 }
      );
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string' || phone.length > 20) {
        return NextResponse.json(
          { error: 'Phone number cannot exceed 20 characters.' },
          { status: 400 }
        );
      }
    }

    if (address !== undefined && address !== null && address !== '') {
      if (typeof address !== 'string' || address.length > 500) {
        return NextResponse.json(
          { error: 'Address cannot exceed 500 characters.' },
          { status: 400 }
        );
      }
    }

    if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
      const parsedDate = new Date(dateOfBirth);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date of birth format. Use YYYY-MM-DD.' },
          { status: 400 }
        );
      }
    }

    const pool = await getPool();

    // Validate department exists if provided
    let parsedDeptId: number | null = null;
    if (departmentId !== undefined && departmentId !== null && departmentId !== '') {
      parsedDeptId = parseInt(String(departmentId), 10);
      if (isNaN(parsedDeptId)) {
        return NextResponse.json({ error: 'Invalid Department ID.' }, { status: 400 });
      }
      const deptCheck = await pool
        .request()
        .input('deptId', parsedDeptId)
        .query('SELECT DepartmentID FROM Departments WHERE DepartmentID = @deptId');
      if (deptCheck.recordset.length === 0) {
        return NextResponse.json({ error: 'Selected department does not exist.' }, { status: 400 });
      }
    }

    // 2. Execute Parameterized UPDATE strictly scoped to the authenticated UserID
    const updateReq = pool.request().input('userId', authUser.userId);

    const updateFields: string[] = [];

    if (firstName !== undefined) {
      updateReq.input('firstName', firstName.trim());
      updateFields.push('FirstName = @firstName');
    }

    if (lastName !== undefined) {
      updateReq.input('lastName', lastName.trim());
      updateFields.push('LastName = @lastName');
    }

    if (phone !== undefined) {
      updateReq.input('phone', phone ? phone.trim() : null);
      updateFields.push('Phone = @phone');
    }

    if (address !== undefined) {
      updateReq.input('address', address ? address.trim() : null);
      updateFields.push('Address = @address');
    }

    if (dateOfBirth !== undefined) {
      updateReq.input('dob', dateOfBirth ? dateOfBirth : null);
      updateFields.push('DateOfBirth = @dob');
    }

    if (departmentId !== undefined) {
      updateReq.input('deptId', parsedDeptId);
      updateFields.push('DepartmentID = @deptId');
    }

    if (profileImageUrl !== undefined) {
      updateReq.input('profileImageUrl', profileImageUrl ? String(profileImageUrl).trim() : null);
      updateFields.push('ProfileImageURL = @profileImageUrl');
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields provided to update.' }, { status: 400 });
    }

    const updateSql = `
      UPDATE Students
      SET ${updateFields.join(', ')}
      WHERE UserID = @userId
    `;

    const updateResult = await updateReq.query(updateSql);

    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    // 3. Return fresh updated profile
    const fetchFresh = await pool
      .request()
      .input('userId', authUser.userId)
      .query(`
        SELECT 
          s.StudentID,
          s.StudentNumber,
          s.FirstName,
          s.LastName,
          CONVERT(VARCHAR(10), s.DateOfBirth, 120) AS DateOfBirth,
          s.Phone,
          s.Address,
          s.DepartmentID,
          s.EnrollmentYear,
          s.GPA,
          s.ProfileImageURL,
          u.UserID,
          u.Email,
          u.Role,
          d.Name AS DepartmentName,
          d.Code AS DepartmentCode
        FROM Students s
        INNER JOIN Users u ON s.UserID = u.UserID
        LEFT JOIN Departments d ON s.DepartmentID = d.DepartmentID
        WHERE u.UserID = @userId
      `);

    const fresh = fetchFresh.recordset[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully.',
        profile: {
          studentId: fresh.StudentID,
          studentNumber: fresh.StudentNumber,
          userId: fresh.UserID,
          email: fresh.Email,
          firstName: fresh.FirstName,
          lastName: fresh.LastName,
          fullName: `${fresh.FirstName} ${fresh.LastName}`.trim(),
          dateOfBirth: fresh.DateOfBirth,
          phone: fresh.Phone,
          address: fresh.Address,
          departmentId: fresh.DepartmentID,
          departmentName: fresh.DepartmentName,
          departmentCode: fresh.DepartmentCode,
          enrollmentYear: fresh.EnrollmentYear,
          gpa: fresh.GPA !== null ? Number(fresh.GPA).toFixed(2) : '0.00',
          profileImageUrl: fresh.ProfileImageURL,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating profile.' },
      { status: 500 }
    );
  }
}
