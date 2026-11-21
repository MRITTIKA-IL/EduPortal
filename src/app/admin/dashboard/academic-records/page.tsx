
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, RefreshCw, Eye, X } from 'lucide-react';

interface Subject {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  subjectName: string;
  credits: number;
  level: string;
  departmentName: string;
  semester: string;
  status: string;
  grade: string | null;
  gradePoints: number | null;
  enrolledAt: string;
  isGraded: boolean;
}

interface StudentRecord {
  studentId: number;
  studentNumber: string;
  name: string;
  department: string;
  enrollmentYear: number;
  cumulativeGpa: string | null;
  totalCreditsAttempted: number;
  totalCreditsEarned: number;
  totalSubjects: number;
  gradedSubjects: number;
  subjects: Subject[];
}

export default function AdminAcademicRecordsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] =
    useState<StudentRecord | null>(null);
  const [savingGrade, setSavingGrade] = useState<number | null>(null);
const [gradeMessage, setGradeMessage] = useState('');
const [gradeEdits, setGradeEdits] = useState<
  Record<number, { grade: string; status: string }>
>({});

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/academic-records');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch academic records');
      }

      setStudents(data.students);
      setSelectedStudent((current) =>
  current
    ? data.students.find(
        (student: StudentRecord) =>
          student.studentId === current.studentId
      ) ?? current
    : null
);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };
const handleSaveGrade = async (
  enrollmentId: number,
  grade: string,
  status: string
) => {
  try {
    setSavingGrade(enrollmentId);
    setGradeMessage('');

    const response = await fetch('/api/admin/academic-records', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrollmentId,
        grade,
        status,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update grade');
    }

    setGradeMessage('Grade updated successfully!');

    await fetchRecords();

  } catch (err) {
    setGradeMessage(
      err instanceof Error ? err.message : 'Something went wrong'
    );
  } finally {
    setSavingGrade(null);
  }
};
  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    return (
      student.name.toLowerCase().includes(search) ||
      student.studentNumber.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/admin/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Academic Records
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View student academic performance and records
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {students.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Students With Records</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {students.filter((student) => student.totalSubjects > 0).length}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by student name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">
          Loading academic records...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-red-600">{error}</p>
      ) : filteredStudents.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="font-semibold text-gray-800">
            No Students Found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            No students match your search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Department</th>
                <th className="p-4">Year</th>
                <th className="p-4">GPA</th>
                <th className="p-4">Subjects</th>
                <th className="p-4">Credits Earned</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.studentId} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {student.studentNumber}
                    </p>
                  </td>

                  <td className="p-4">{student.department || '-'}</td>
                  <td className="p-4">{student.enrollmentYear || '-'}</td>
                  <td className="p-4 font-medium">
                    {student.cumulativeGpa ?? '-'}
                  </td>
                  <td className="p-4">{student.totalSubjects}</td>
                  <td className="p-4">{student.totalCreditsEarned}</td>

                  <td className="p-4">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-700 hover:bg-indigo-100"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedStudent.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedStudent.studentNumber} | {selectedStudent.department}
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Cumulative GPA</p>
                <p className="mt-1 text-xl font-bold">
                  {selectedStudent.cumulativeGpa ?? '-'}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Subjects</p>
                <p className="mt-1 text-xl font-bold">
                  {selectedStudent.totalSubjects}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Credits Attempted</p>
                <p className="mt-1 text-xl font-bold">
                  {selectedStudent.totalCreditsAttempted}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Credits Earned</p>
                <p className="mt-1 text-xl font-bold">
                  {selectedStudent.totalCreditsEarned}
                </p>
              </div>
            </div>

            <h3 className="mb-3 font-semibold text-gray-800">
              Subject Records
            </h3>
            {gradeMessage && (
  <p className="mb-3 text-sm font-medium text-green-600">
    {gradeMessage}
  </p>
)}

            {selectedStudent.subjects.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
                No academic records available for this student yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3">Course</th>
                      <th className="p-3">Semester</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Grade Points</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedStudent.subjects.map((subject) => (
                      <tr key={subject.enrollmentId} className="border-t">
                        <td className="p-3">
                          <p className="font-medium">{subject.subjectName}</p>
                          <p className="text-xs text-gray-500">
                            {subject.courseCode}
                          </p>
                        </td>
                        <td className="p-3">{subject.semester}</td>
                        <td className="p-3">{subject.credits}</td>
                        <td className="p-3">
  <select
    className="border rounded-md p-2"
    value={
      gradeEdits[subject.enrollmentId]?.status ?? subject.status
    }
    onChange={(e) =>
      setGradeEdits((prev) => ({
        ...prev,
        [subject.enrollmentId]: {
          grade:
            prev[subject.enrollmentId]?.grade ??
            subject.grade ??
            '',
          status: e.target.value,
        },
      }))
    }
  >
    <option value="Active">Active</option>
    <option value="Completed">Completed</option>
  </select>
</td>
                        <td className="p-3">
  {gradeEdits[subject.enrollmentId]?.grade
    ? ({
        O: 10,
        'A+': 9,
        A: 8,
        'B+': 7,
        B: 6,
        C: 5,
        F: 0,
      }[gradeEdits[subject.enrollmentId].grade] ?? '—')
    : subject.gradePoints ?? '—'}
</td>
                        <td className="p-3">
  <select
    className="border rounded-md p-2"
    value={
      gradeEdits[subject.enrollmentId]?.grade ??
      subject.grade ??
      ''
    }
    onChange={(e) =>
      setGradeEdits((prev) => ({
        ...prev,
        [subject.enrollmentId]: {
          grade: e.target.value,
          status:
            prev[subject.enrollmentId]?.status ?? subject.status,
        },
      }))
    }
  >
    <option value="">Select Grade</option>
    <option value="O">O</option>
    <option value="A+">A+</option>
    <option value="A">A</option>
    <option value="B+">B+</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="F">F</option>
  </select>
</td><td className="p-3">
  <button
    onClick={() =>
      handleSaveGrade(
        subject.enrollmentId,
        gradeEdits[subject.enrollmentId]?.grade ??
          subject.grade ??
          '',
        gradeEdits[subject.enrollmentId]?.status ??
          subject.status
      )
    }
    disabled={
      savingGrade === subject.enrollmentId ||
      !(gradeEdits[subject.enrollmentId]?.grade ?? subject.grade)
    }
    className="bg-blue-600 text-white px-3 py-2 rounded-md disabled:opacity-50"
  >
    {savingGrade === subject.enrollmentId ? 'Saving...' : 'Save'}
  </button>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
