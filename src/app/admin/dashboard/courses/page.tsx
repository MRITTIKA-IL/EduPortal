
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';

interface Course {
  courseId: number;
  courseCode: string;
  title: string;
  description: string;
  credits: number;
  departmentId: number | null;
  level: string;
  isActive: boolean;
  departmentName: string | null;
  departmentCode: string | null;
}
interface Department {
  departmentId: number;
  name: string;
  code: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

const [editFormData, setEditFormData] = useState({
  courseCode: '',
  title: '',
  description: '',
  credits: 3,
  departmentId: '',
  level: 'Undergraduate',
});
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
  courseCode: '',
  title: '',
  description: '',
  credits: 3,
  departmentId: '',
  level: 'Undergraduate',
});


  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/courses');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to fetch courses.');
      }

      setCourses(data.courses || []);
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

    if (response.ok) {
      setDepartments(data.departments || []);
    }
  } catch (error) {
    console.error('Unable to fetch departments:', error);
  }
};
const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const response = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        departmentId: formData.departmentId
          ? Number(formData.departmentId)
          : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to create course.');
    }

    alert('Course created successfully!');

    setShowAddForm(false);

    setFormData({
      courseCode: '',
      title: '',
      description: '',
      credits: 3,
      departmentId: '',
      level: 'Undergraduate',
    });

    fetchCourses();
  } catch (error) {
    alert(
      error instanceof Error ? error.message : 'Something went wrong.'
    );
  }
};

  useEffect(() => {
  fetchCourses();
  fetchDepartments();
}, []);

const handleEditCourse = async () => {
  if (editingCourseId === null) return;

  try {
    const response = await fetch('/api/admin/courses', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: editingCourseId,
        ...editFormData,
        departmentId: editFormData.departmentId
          ? Number(editFormData.departmentId)
          : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to update course.');
    }

    alert('Course updated successfully!');

    setEditingCourseId(null);
    fetchCourses();

  } catch (error) {
    alert(
      error instanceof Error ? error.message : 'Something went wrong.'
    );
  }
};

const handleToggleCourseStatus = async (course: Course) => {
  const newStatus = !course.isActive;

  const confirmed = window.confirm(
    `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${course.title}?`
  );

  if (!confirmed) return;

  try {
    const response = await fetch('/api/admin/courses', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: course.courseId,
        isActive: newStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to change course status.');
    }

    alert(data.message);
    fetchCourses();

  } catch (error) {
    alert(
      error instanceof Error ? error.message : 'Something went wrong.'
    );
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduPortal</h1>
              <p className="text-xs text-gray-500">Course Management</p>
            </div>
          </div>

          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              ADMINISTRATION
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Course Management
            </h2>
            <p className="mt-2 text-gray-600">
              View and manage all courses in EduPortal.
            </p>
          </div>

          <div className="flex items-center gap-2">
  <button
    onClick={() => setShowAddForm(!showAddForm)}
    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
  >
    + Add Course
  </button>

  <button
    onClick={fetchCourses}
    disabled={loading}
    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
  >
    <RefreshCw className="h-4 w-4" />
    Refresh
  </button>
</div>

  

</div>

{showAddForm && (
  <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
    <h3 className="mb-5 text-xl font-bold text-gray-900">
      Add New Course
    </h3>

    <form onSubmit={handleAddCourse} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Course Code *
        </label>
        <input
          type="text"
          required
          value={formData.courseCode}
          onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Example: CS501"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Course Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Credits
        </label>
        <input
          type="number"
          min="1"
          value={formData.credits}
          onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          value={formData.departmentId}
          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department.departmentId} value={department.departmentId}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Level
        </label>
        <select
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="Undergraduate">Undergraduate</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="Diploma">Diploma</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          placeholder="Enter course description"
        />
      </div>

      <div className="flex gap-3 md:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Save Course
        </button>

        <button
          type="button"
          onClick={() => setShowAddForm(false)}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

{editingCourseId !== null && (
  <div className="mb-6 rounded-xl border border-indigo-200 bg-white p-6">
    <h3 className="mb-5 text-xl font-bold text-gray-900">
      Edit Course
    </h3>

    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleEditCourse();
      }}
      className="grid grid-cols-1 gap-5 md:grid-cols-2"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Course Code *
        </label>
        <input
          type="text"
          required
          value={editFormData.courseCode}
          onChange={(e) =>
            setEditFormData({ ...editFormData, courseCode: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Course Title *
        </label>
        <input
          type="text"
          required
          value={editFormData.title}
          onChange={(e) =>
            setEditFormData({ ...editFormData, title: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Credits
        </label>
        <input
          type="number"
          min="1"
          value={editFormData.credits}
          onChange={(e) =>
            setEditFormData({ ...editFormData, credits: Number(e.target.value) })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          value={editFormData.departmentId}
          onChange={(e) =>
            setEditFormData({ ...editFormData, departmentId: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option
              key={department.departmentId}
              value={department.departmentId}
            >
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Level
        </label>
        <select
          value={editFormData.level}
          onChange={(e) =>
            setEditFormData({ ...editFormData, level: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="Undergraduate">Undergraduate</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="Diploma">Diploma</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={editFormData.description}
          onChange={(e) =>
            setEditFormData({ ...editFormData, description: e.target.value })
          }
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-3 md:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Update Course
        </button>

        <button
          type="button"
          onClick={() => setEditingCourseId(null)}
          className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}


        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Courses</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {courses.length}
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            Loading courses...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            No courses found.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
  Actions
</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((course) => (
                    <tr key={course.courseId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {course.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {course.courseCode}
                        </p>
                        <p className="mt-1 max-w-md text-xs text-gray-500">
                          {course.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {course.departmentName || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {course.level}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {course.credits}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            course.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {course.isActive ? 'Active' : 'Inactive'}
                        
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
  type="button"
  onClick={() => {
    setEditingCourseId(course.courseId);
                            setEditFormData({
                              courseCode: course.courseCode,
                              title: course.title,
                              description: course.description || '',
                              credits: course.credits,
                              departmentId: course.departmentId
                                ? String(course.departmentId)
                                : '',
                              level: course.level,
                            });
                          }}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                                                >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCourseStatus(course)}
                          className={`ml-2 rounded-lg px-3 py-2 text-sm text-white ${
                            course.isActive
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {course.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
