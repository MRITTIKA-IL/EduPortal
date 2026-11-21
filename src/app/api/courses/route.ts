// src/app/api/courses/route.ts
// GET /api/courses — returns course catalog from SQL Server
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dept = searchParams.get('dept');
    const level = searchParams.get('level');

    let sql = `
      SELECT 
        c.CourseID,
        c.CourseCode,
        c.Title,
        c.Description,
        c.Credits,
        c.Level,
        d.Name  AS DepartmentName,
        d.Code  AS DepartmentCode
      FROM Courses c
      LEFT JOIN Departments d ON c.DepartmentID = d.DepartmentID
      WHERE c.IsActive = 1
    `;

    const params: Record<string, unknown> = {};

    if (dept) {
      sql += ' AND d.Code = @dept';
      params.dept = dept;
    }
    if (level) {
      sql += ' AND c.Level = @level';
      params.level = level;
    }

    sql += ' ORDER BY d.Name, c.CourseCode';

    const courses = await query(sql, params);

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Courses API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
