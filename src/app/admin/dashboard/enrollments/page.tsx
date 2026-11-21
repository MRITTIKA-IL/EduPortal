
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Enrollment {
  EnrollmentID: number;
  StudentID: number;
  StudentNumber: string;
  FirstName: string;
  LastName: string;
  CourseID: number;
  CourseCode: string;
  CourseTitle: string;
  Credits: number;
  Semester: string;
  Status: string;
  Grade: string | null;
  GradePoints: number | null;
  EnrolledAt: string;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/enrollments');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch enrollments');
      }

      setEnrollments(data.enrollments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <div className="p-6">
      <Link
        href="/admin/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Enrollments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View all student course enrollments
          </p>
        </div>

        <button
          onClick={fetchEnrollments}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Enrollments</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {enrollments.length}
        </p>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading enrollments...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-red-600">{error}</p>
      ) : enrollments.length === 0 ? (
        <div className="rounded-lg border bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No Enrollments Found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Student enrollments will appear here when students enroll in courses.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Semester</th>
                <th className="p-3">Status</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Grade Points</th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((enrollment) => (
                <tr
                  key={enrollment.EnrollmentID}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    <p className="font-medium">
                      {enrollment.FirstName} {enrollment.LastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {enrollment.StudentNumber}
                    </p>
                  </td>

                  <td className="p-3">
                    <p className="font-medium">{enrollment.CourseTitle}</p>
                    <p className="text-xs text-gray-500">
                      {enrollment.CourseCode}
                    </p>
                  </td>

                  <td className="p-3">{enrollment.Credits}</td>
                  <td className="p-3">{enrollment.Semester}</td>
                  <td className="p-3">{enrollment.Status}</td>
                  <td className="p-3">{enrollment.Grade || '-'}</td>
                  <td className="p-3">{enrollment.GradePoints ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
