
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';


// GET /api/admin/courses — Fetch all courses (Admin only)
export async function GET(request: NextRequest) {
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
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const pool = await getPool();

    const result = await pool.request().query(`
      SELECT
        c.CourseID,
        c.CourseCode,
        c.Title,
        c.Description,
        c.Credits,
        c.DepartmentID,
        c.Level,
        c.IsActive,
        d.Name AS DepartmentName,
        d.Code AS DepartmentCode
      FROM Courses c
      LEFT JOIN Departments d
        ON c.DepartmentID = d.DepartmentID
      ORDER BY c.CourseID DESC
    `);

    const courses = result.recordset.map((course) => ({
      courseId: course.CourseID,
      courseCode: course.CourseCode,
      title: course.Title,
      description: course.Description,
      credits: course.Credits,
      departmentId: course.DepartmentID,
      level: course.Level,
      isActive: course.IsActive,
      departmentName: course.DepartmentName,
      departmentCode: course.DepartmentCode,
    }));

    return NextResponse.json({
      success: true,
      total: courses.length,
      courses,
    });
  } catch (error) {
    console.error('Fetch Admin Courses Error:', error);

    return NextResponse.json(
      { error: 'Unable to fetch courses.' },
      { status: 500 }
    );
  }
}


// POST /api/admin/courses — Create a new course (Admin only)
export async function POST(request: NextRequest) {
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
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      courseCode,
      title,
      description,
      credits,
      departmentId,
      level,
    } = body;

    if (!courseCode?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: 'Course code and title are required.' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('CourseCode', courseCode.trim())
      .input('Title', title.trim())
      .input('Description', description?.trim() || null)
      .input('Credits', Number(credits) || 3)
      .input('DepartmentID', departmentId || null)
      .input('Level', level?.trim() || 'Undergraduate')
      .query(`
        INSERT INTO Courses (
          CourseCode,
          Title,
          Description,
          Credits,
          DepartmentID,
          Level,
          IsActive
        )
        OUTPUT INSERTED.CourseID AS courseId
        VALUES (
          @CourseCode,
          @Title,
          @Description,
          @Credits,
          @DepartmentID,
          @Level,
          1
        )
      `);

    return NextResponse.json(
      {
        success: true,
        message: 'Course created successfully.',
        courseId: result.recordset[0].courseId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Admin Course Error:', error);

    return NextResponse.json(
      { error: 'Unable to create course.' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses — Update an existing course (Admin only)
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
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      courseId,
      courseCode,
      title,
      description,
      credits,
      departmentId,
      level,
    } = body;

    if (!courseId || !courseCode?.trim() || !title?.trim()) {
      return NextResponse.json(
        { error: 'Course ID, course code and title are required.' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('CourseID', Number(courseId))
      .input('CourseCode', courseCode.trim())
      .input('Title', title.trim())
      .input('Description', description?.trim() || null)
      .input('Credits', Number(credits) || 3)
      .input(
        'DepartmentID',
        departmentId ? Number(departmentId) : null
      )
      .input('Level', level?.trim() || 'Undergraduate')
      .query(`
        UPDATE Courses
        SET
          CourseCode = @CourseCode,
          Title = @Title,
          Description = @Description,
          Credits = @Credits,
          DepartmentID = @DepartmentID,
          Level = @Level
        WHERE CourseID = @CourseID;

        SELECT @@ROWCOUNT AS affectedRows;
      `);

    if (result.recordset[0].affectedRows === 0) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully.',
    });

  } catch (error) {
    console.error('Update Admin Course Error:', error);

    return NextResponse.json(
      { error: 'Unable to update course.' },
      { status: 500 }
    );
  }
}



// PATCH /api/admin/courses — Activate or Deactivate a course (Admin only)
export async function PATCH(request: NextRequest) {
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
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, isActive } = body;

    if (!courseId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Course ID and valid active status are required.' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('CourseID', Number(courseId))
      .input('IsActive', isActive)
      .query(`
        UPDATE Courses
        SET IsActive = @IsActive
        WHERE CourseID = @CourseID;

        SELECT @@ROWCOUNT AS affectedRows;
      `);

    if (result.recordset[0].affectedRows === 0) {
      return NextResponse.json(
        { error: 'Course not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isActive
        ? 'Course activated successfully.'
        : 'Course deactivated successfully.',
    });

  } catch (error) {
    console.error('Change Course Status Error:', error);

    return NextResponse.json(
      { error: 'Unable to change course status.' },
      { status: 500 }
    );
  }
}
