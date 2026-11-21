'use client';

// src/app/(public)/courses/page.tsx
import { useState, useEffect } from 'react';
import { Clock, Building2, Loader2, AlertCircle } from 'lucide-react';

interface Course {
  CourseID: number;
  CourseCode: string;
  Title: string;
  Description: string;
  Credits: number;
  Level: string;
  DepartmentName: string;
  DepartmentCode: string;
}

const departments = [
  { id: 1, name: 'Computer Science', code: 'CS' },
  { id: 2, name: 'Business Administration', code: 'BA' },
  { id: 3, name: 'Engineering', code: 'ENG' },
  { id: 4, name: 'Medicine & Health', code: 'MED' },
  { id: 5, name: 'Arts & Humanities', code: 'AH' },
];

const fallbackCourses: Course[] = [
  { CourseID: 1, CourseCode: 'CS101', Title: 'Introduction to Programming', DepartmentName: 'Computer Science', DepartmentCode: 'CS', Credits: 3, Level: 'Undergraduate', Description: 'Learn Python basics, algorithms, and problem solving fundamentals.' },
  { CourseID: 2, CourseCode: 'CS201', Title: 'Data Structures & Algorithms', DepartmentName: 'Computer Science', DepartmentCode: 'CS', Credits: 3, Level: 'Undergraduate', Description: 'Arrays, linked lists, trees, graphs, sorting and searching algorithms.' },
  { CourseID: 3, CourseCode: 'CS301', Title: 'Database Systems', DepartmentName: 'Computer Science', DepartmentCode: 'CS', Credits: 3, Level: 'Undergraduate', Description: 'SQL, database design, normalization, transactions, and optimization.' },
  { CourseID: 4, CourseCode: 'CS401', Title: 'Machine Learning', DepartmentName: 'Computer Science', DepartmentCode: 'CS', Credits: 3, Level: 'Postgraduate', Description: 'Supervised, unsupervised learning, neural networks, and deep learning.' },
  { CourseID: 5, CourseCode: 'BA101', Title: 'Principles of Management', DepartmentName: 'Business Administration', DepartmentCode: 'BA', Credits: 3, Level: 'Undergraduate', Description: 'Introduction to organizational management, leadership, and strategy.' },
  { CourseID: 6, CourseCode: 'BA201', Title: 'Financial Accounting', DepartmentName: 'Business Administration', DepartmentCode: 'BA', Credits: 3, Level: 'Undergraduate', Description: 'Basics of accounting, financial statements, and business reporting.' },
  { CourseID: 7, CourseCode: 'ENG101', Title: 'Engineering Mathematics I', DepartmentName: 'Engineering', DepartmentCode: 'ENG', Credits: 4, Level: 'Undergraduate', Description: 'Calculus, linear algebra, and differential equations for engineers.' },
  { CourseID: 8, CourseCode: 'MED101', Title: 'Human Anatomy & Physiology', DepartmentName: 'Medicine & Health', DepartmentCode: 'MED', Credits: 4, Level: 'Undergraduate', Description: 'Structure and function of the human body — all major systems.' },
];

const levelColors: Record<string, string> = {
  Undergraduate: 'bg-green-50 text-green-700',
  Postgraduate: 'bg-purple-50 text-purple-700',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeDept, setActiveDept] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
const [enrollmentMessage, setEnrollmentMessage] = useState<{
  type: 'success' | 'error';
  text: string;
} | null>(null);

const handleEnroll = async (courseId: number) => {
  try {
    setEnrollingCourseId(courseId);
    setEnrollmentMessage(null);

    const response = await fetch('/api/student/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Enrollment failed.');
    }

    setEnrollmentMessage({
      type: 'success',
      text: data.message,
    });
  } catch (err) {
    setEnrollmentMessage({
      type: 'error',
      text: err instanceof Error ? err.message : 'Something went wrong.',
    });
  } finally {
    setEnrollingCourseId(null);
  }
};

  useEffect(() => {
    async function loadCourses() {
      setLoading(true);
      setError(null);
      try {
        const url = activeDept === 'ALL' ? '/api/courses' : `/api/courses?dept=${encodeURIComponent(activeDept)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (err: unknown) {
        console.error('Failed to load courses from API:', err);
        setError('Unable to reach the courses database. Showing offline catalog.');
        // Fallback to static courses filtered locally
        if (activeDept === 'ALL') {
          setCourses(fallbackCourses);
        } else {
          setCourses(fallbackCourses.filter((c) => c.DepartmentCode === activeDept));
        }
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [activeDept]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Course Catalog</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Explore over 200 programs across 5 schools. Find the perfect course
            for your career goals.
          </p>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Department Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDept('ALL')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeDept === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              All
            </button>
            {departments.map((d) => (
              <button
                key={d.code}
                onClick={() => setActiveDept(d.code)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeDept === 'd.code' || activeDept === d.code
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading courses from database...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}
          {enrollmentMessage && (
  <div
    className={`mb-6 rounded-lg border p-4 text-sm ${
      enrollmentMessage.type === 'success'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-red-200 bg-red-50 text-red-700'
    }`}
  >
    {enrollmentMessage.text}
  </div>
)}

          {/* Course Cards */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No courses found for this department.
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.CourseCode}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        <Building2 className="h-3 w-3" /> {course.DepartmentName || course.DepartmentCode}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[course.Level] || 'bg-gray-100 text-gray-700'}`}>
                        {course.Level}
                      </span>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {course.Title}
                    </h3>
                    <p className="mb-3 text-xs text-gray-400">{course.CourseCode}</p>
                    <p className="mb-4 flex-1 text-sm text-gray-500 leading-relaxed">
                      {course.Description}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5" /> {course.Credits} Credits
                      </span>
                      <button
  onClick={() => handleEnroll(course.CourseID)}
  disabled={enrollingCourseId === course.CourseID}
  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
>
  {enrollingCourseId === course.CourseID ? 'Enrolling...' : 'Enroll'}
</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
