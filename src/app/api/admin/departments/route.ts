import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getPool } from '@/lib/db';

// GET /api/admin/departments
// Fetch all departments — Admin only
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
      SELECT DepartmentID, Name, Code
      FROM Departments
      ORDER BY Name ASC
    `);

    const departments = result.recordset.map((department) => ({
      departmentId: department.DepartmentID,
      name: department.Name,
      code: department.Code,
    }));

    return NextResponse.json({
      success: true,
      departments,
    });

  } catch (error) {
    console.error('Fetch Departments Error:', error);

    return NextResponse.json(
      { error: 'Unable to fetch departments.' },
      { status: 500 }
    );
  }
}