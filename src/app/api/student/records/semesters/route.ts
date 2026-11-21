// src/app/api/student/records/semesters/route.ts
// GET /api/student/records/semesters — Returns semester-wise grouped academic records with semester GPA
import { NextRequest, NextResponse } from 'next/server';
import { GET as getAcademicRecords } from '../route';

export async function GET(request: NextRequest) {
  // Leverage the central records logic and return the semester-grouped view
  const response = await getAcademicRecords(request);
  if (!response.ok) {
    return response;
  }

  const data = await response.json();
  return NextResponse.json(
    {
      success: true,
      student: data.student,
      summary: data.summary,
      semesters: data.semesters,
    },
    { status: 200 }
  );
}
