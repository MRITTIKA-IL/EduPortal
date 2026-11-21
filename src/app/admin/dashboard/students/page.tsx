
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Users,
  GraduationCap,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  X,
  Save,
} from 'lucide-react';

interface Student {
  studentId: number;
  studentNumber: string;
  userId: number;
  email: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string | null;
  enrollmentYear: number;
  gpa: string;
  departmentName: string | null;
  departmentCode: string | null;
  address: string | null;
dateOfBirth: string | null;
departmentId: number | null;
}

interface Department {
  departmentId: number;
  name: string;
  code: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Student editing states
const [editingStudent, setEditingStudent] = useState<Student | null>(null);
const [saving, setSaving] = useState(false);
const [editError, setEditError] = useState('');
const [successMessage, setSuccessMessage] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load students.');
      }

      setStudents(data.students || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchDepartments = async () => {
  try {
    const response = await fetch('/api/admin/departments');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load departments.');
    }

    setDepartments(data.departments || []);
  } catch (error) {
    console.error('Fetch Departments Error:', error);
  }
};
  // Open the edit form with existing student details
const handleEdit = (student: Student) => {
  setEditingStudent({ ...student });
  setEditError('');
  setSuccessMessage('');
};

// Update student details
const handleSave = async () => {
  if (!editingStudent) return;

  setSaving(true);
  setEditError('');
  setSuccessMessage('');

  try {
    const response = await fetch('/api/admin/students', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: editingStudent.studentId,
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        phone: editingStudent.phone,
        address: editingStudent.address,
        dateOfBirth: editingStudent.dateOfBirth,
        departmentId: editingStudent.departmentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to update student.');
    }

    setSuccessMessage('Student profile updated successfully.');
    setEditingStudent(null);

    await fetchStudents();
  } catch (err) {
    setEditError(
      err instanceof Error ? err.message : 'Something went wrong.'
    );
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
  fetchStudents();
  fetchDepartments();
}, []);

  const filteredStudents = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return students;

    return students.filter((student) =>
      [
        student.fullName,
        student.email,
        student.studentNumber,
        student.departmentName || '',
      ].some((value) => value.toLowerCase().includes(searchText))
    );
  }, [students, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-4">
          <Link
            href="/admin/dashboard"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Student Management
            </h1>
            <p className="text-xs text-gray-500">
              EduPortal Administration
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {successMessage && (
  <div className="mb-5 rounded-lg bg-green-50 p-4 text-sm text-green-700">
    {successMessage}
  </div>
)}

{editError && (
  <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
    {editError}
  </div>
)}

{editingStudent && (
  <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Edit Student Profile
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Update details for {editingStudent.fullName}
        </p>
      </div>

      <button
        onClick={() => setEditingStudent(null)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          value={editingStudent.firstName}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              firstName: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          value={editingStudent.lastName}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              lastName: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          value={editingStudent.phone || ''}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              phone: e.target.value,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>
      <div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Department
  </label>

  <select
    value={editingStudent.departmentId ?? ''}
    onChange={(e) =>
      setEditingStudent({
        ...editingStudent,
        departmentId: e.target.value
          ? Number(e.target.value)
          : null,
      })
    }
    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
  >
    <option value="">Select Department</option>

    {departments.map((department) => (
      <option
        key={department.departmentId}
        value={department.departmentId}
      >
        {department.name} ({department.code})
      </option>
    ))}
  </select>
</div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          value={
            editingStudent.dateOfBirth
              ? editingStudent.dateOfBirth.slice(0, 10)
              : ''
          }
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              dateOfBirth: e.target.value || null,
            })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          value={editingStudent.address || ''}
          onChange={(e) =>
            setEditingStudent({
              ...editingStudent,
              address: e.target.value,
            })
          }
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={() => setEditingStudent(null)}
        disabled={saving}
        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
)}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Students
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              View and manage registered student information.
            </p>
          </div>

          <button
            onClick={fetchStudents}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-3">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-3">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading
                    ? '...'
                    : students.filter((student) => student.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Student Directory
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {filteredStudents.length} student(s) found
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, ID, department..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading students...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchStudents}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Student Number</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Year</th>
                    <th className="px-5 py-4">GPA</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.studentId}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {student.fullName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {student.email}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.studentNumber}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.departmentName || 'Not assigned'}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {student.enrollmentYear}
                      </td>

                      <td className="px-5 py-4 font-medium text-gray-700">
                        {student.gpa}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            student.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
  <button
    onClick={() => handleEdit(student)}
    className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
  >
    <Pencil className="h-4 w-4" />
    Edit
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
