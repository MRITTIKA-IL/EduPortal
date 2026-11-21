
'use client';

// src/app/student/dashboard/page.tsx
// Student Dashboard — Profile, Enrollments and Academic Records

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Award,
  Calendar,
  Building2,
  Bell,
  ArrowRight,
  Loader2,
  User,
  ShieldCheck,
  AlertCircle,
  Menu,
  X,
  Trash2,
  Phone,
  MapPin,
  Layers,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface StudentProfile {
  studentId: number;
  studentNumber: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: string | null;
  phone?: string | null;
  address?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  departmentCode?: string | null;
  enrollmentYear?: number | null;
  gpa?: string | null;
  profileImageUrl?: string | null;
}

interface Enrollment {
  EnrollmentID: number;
  CourseID: number;
  CourseCode: string;
  Title: string;
  Description?: string | null;
  Credits: number;
  Level: string;
  DepartmentName?: string | null;
  DepartmentCode?: string | null;
  Semester: string;
  Status: string;
  Grade?: string | null;
  GradePoints?: number | null;
  EnrolledAt: string;
}

interface SubjectRecord {
  enrollmentId: number;
  courseId: number;
  courseCode: string;
  subjectName: string;
  credits: number;
  level: string;
  departmentName: string;
  departmentCode: string;
  semester: string;
  status: string;
  grade: string | null;
  gradePoints: number | null;
  marks: number | null;
  isGraded: boolean;
}

interface SemesterRecord {
  semester: string;
  semesterGpa: string | null;
  totalCredits: number;
  earnedCredits: number;
  subjects: SubjectRecord[];
}

interface AcademicSummary {
  cumulativeGpa: string | null;
  totalCreditsAttempted: number;
  totalCreditsEarned: number;
  totalSubjects: number;
  gradedSubjects: number;
}

type TabType = 'dashboard' | 'my-courses' | 'records' | 'profile';

export default function StudentDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [totalActiveCredits, setTotalActiveCredits] = useState(0);

  const [academicSummary, setAcademicSummary] =
    useState<AcademicSummary | null>(null);

  const [academicSemesters, setAcademicSemesters] =
    useState<SemesterRecord[]>([]);

  const [academicError, setAcademicError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [droppingId, setDroppingId] = useState<number | null>(null);

  // Load all dashboard information
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAcademicError(null);

    try {
      const [profileRes, enrollmentsRes, recordsRes] =
        await Promise.all([
          fetch('/api/student/profile', { cache: 'no-store' }),
          fetch('/api/student/enrollments', { cache: 'no-store' }),
          fetch('/api/student/records', { cache: 'no-store' }),
        ]);

      // Redirect if the student session has expired
      if (
        profileRes.status === 401 ||
        enrollmentsRes.status === 401 ||
        recordsRes.status === 401
      ) {
        router.replace(
          '/student/login?callbackUrl=/student/dashboard'
        );
        return;
      }

      const profileData = await profileRes.json();
      const enrollmentsData = await enrollmentsRes.json();
      const recordsData = await recordsRes.json();

      // Profile is required to display the dashboard
      if (!profileRes.ok || !profileData.success) {
        throw new Error(
          profileData.error || 'Unable to load student profile.'
        );
      }

      setProfile(profileData.profile);

      // Load course enrollments
      if (!enrollmentsRes.ok || !enrollmentsData.success) {
        throw new Error(
          enrollmentsData.error || 'Unable to load course enrollments.'
        );
      }

      const loadedEnrollments: Enrollment[] =
        enrollmentsData.enrollments || [];

      setEnrollments(loadedEnrollments);

      setTotalActiveCredits(
        Number(enrollmentsData.totalActiveCredits) || 0
      );

      // Load academic records
      if (!recordsRes.ok || !recordsData.success) {
        setAcademicSummary(null);
        setAcademicSemesters([]);

        setAcademicError(
          recordsData.error || 'Unable to load academic records.'
        );
      } else {
        setAcademicSummary(recordsData.summary || null);

        setAcademicSemesters(
          Array.isArray(recordsData.semesters)
            ? recordsData.semesters
            : []
        );
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to the portal server.'
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  // Logout
  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.replace('/');
      router.refresh();
      setLoggingOut(false);
    }
  };

  // Drop course
  const handleDropCourse = async (
    enrollmentId: number,
    courseCode: string
  ) => {
    if (!confirm(`Are you sure you want to drop ${courseCode}?`)) {
      return;
    }

    setDroppingId(enrollmentId);

    try {
      const res = await fetch('/api/student/enrollments/drop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to drop course.');
        return;
      }

      alert('Course dropped successfully.');

      await loadDashboardData();
    } catch (err) {
      console.error('Drop error:', err);
      alert('Unable to reach server to drop course.');
    } finally {
      setDroppingId(null);
    }
  };

  // Derived dashboard information
  const activeEnrollments = enrollments.filter(
    (course) => course.Status?.toLowerCase() === 'active'
  );

  const currentSemester =
    activeEnrollments[0]?.Semester || null;

  const displayGpa =
    academicSummary?.cumulativeGpa ??
    (
      profile?.gpa && Number(profile.gpa) > 0
        ? profile.gpa
        : null
    );

  // Navigation
  const navigationItems: {
    id: TabType;
    label: string;
    icon: ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: 'my-courses',
      label: 'My Courses',
      icon: <BookOpen className="h-4 w-4" />,
      badge: activeEnrollments.length,
    },
    {
      id: 'records',
      label: 'Academic Records',
      icon: <Award className="h-4 w-4" />,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>

                <span className="text-xl font-bold text-gray-900">
                  EduPortal
                </span>
              </Link>

              <span className="hidden sm:inline-flex rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Student Portal
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {item.label}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <Link
                href="/courses"
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Course Catalog
              </Link>
            </nav>

            {/* Desktop Profile and Logout */}
            <div className="hidden sm:flex items-center gap-3">
              {profile && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {profile.firstName?.charAt(0).toUpperCase() || 'S'}
                  </div>

                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-900">
                      {profile.fullName}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {profile.studentNumber}
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-red-600 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">

            {profile && (
              <div className="py-2 mb-2 border-b border-gray-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {profile.firstName?.charAt(0).toUpperCase() || 'S'}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile.studentNumber}
                  </p>
                </div>
              </div>
            )}

            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Course Catalog
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 border-t border-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">
              Loading your student dashboard...
            </p>
          </div>
        ) : error || !profile ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl bg-white p-8 border border-gray-200 shadow-sm max-w-md text-center">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />

              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Failed to Load Dashboard
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                {error || 'Session could not be verified.'}
              </p>

              <button
                onClick={() => void loadDashboardData()}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>

            {/* Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 p-8 text-white shadow-md">
                  <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-sky-200 mb-3">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Student · {profile.departmentName || 'General Program'}
                      </span>

                      <h1 className="text-3xl font-bold sm:text-4xl">
                        Welcome back, {profile.firstName || profile.fullName}!
                      </h1>

                      <p className="mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
                        Here is an overview of your academic status,
                        active enrollments, and performance records.
                      </p>
                    </div>

                    <div className="relative flex flex-wrap gap-3">
                      <button
                        onClick={() => setActiveTab('my-courses')}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-sky-50"
                      >
                        <BookOpen className="h-4 w-4" />
                        My Enrolled Courses
                      </button>

                      <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-300/30 bg-blue-500/20 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500/30"
                      >
                        Course Catalog
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    icon={<BookOpen className="h-6 w-6" />}
                    label="Enrolled Courses"
                    value={activeEnrollments.length.toString()}
                    detail={`${totalActiveCredits} Credits`}
                    color="blue"
                  />

                  <StatCard
                    icon={<Award className="h-6 w-6" />}
                    label="Cumulative GPA"
                    value={displayGpa || 'N/A'}
                    detail={displayGpa ? 'Current performance' : 'Not graded'}
                    color="green"
                  />

                  <StatCard
                    icon={<Building2 className="h-6 w-6" />}
                    label="Department"
                    value={profile.departmentName || 'Undeclared'}
                    detail={profile.departmentCode || 'Department'}
                    color="purple"
                  />

                  <StatCard
                    icon={<Calendar className="h-6 w-6" />}
                    label="Enrollment Year"
                    value={String(profile.enrollmentYear || 'N/A')}
                    detail="Academic information"
                    color="amber"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <div className="lg:col-span-2 space-y-6">

                    {/* Active Courses */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Active Course Enrollments
                          </h2>

                          <p className="text-xs text-gray-500">
                            Current Semester: {currentSemester || 'No active semester'}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab('my-courses')}
                          className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1"
                        >
                          View All <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {activeEnrollments.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50">
                          <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />

                          <p className="text-sm font-medium text-gray-700">
                            No active course registrations yet
                          </p>

                          <Link
                            href="/courses"
                            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                          >
                            Browse Course Catalog
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {activeEnrollments.slice(0, 3).map((course) => (
                            <div
                              key={course.EnrollmentID}
                              className="py-3.5 flex items-center justify-between gap-3"
                            >
                              <div>
                                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                  {course.CourseCode}
                                </span>

                                <h3 className="text-sm font-semibold text-gray-900 mt-1">
                                  {course.Title}
                                </h3>

                                <p className="text-xs text-gray-500">
                                  {course.Credits} Credits · {course.DepartmentName || course.Semester}
                                </p>
                              </div>

                              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                Active
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Academic Summary */}
                    <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Award className="h-5 w-5 text-green-600" />
                          Academic Performance
                        </h2>

                        <button
                          onClick={() => setActiveTab('records')}
                          className="text-xs font-semibold text-blue-600"
                        >
                          View Records →
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <SummaryValue
                          label="Cumulative GPA"
                          value={displayGpa || 'N/A'}
                        />

                        <SummaryValue
                          label="Credits Earned"
                          value={academicSummary?.totalCreditsEarned ?? 0}
                        />

                        <SummaryValue
                          label="Attempted"
                          value={academicSummary?.totalCreditsAttempted ?? 0}
                        />

                        <SummaryValue
                          label="Graded Subjects"
                          value={academicSummary?.gradedSubjects ?? 0}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">

                    <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
                      <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Student Profile Info
                      </h2>

                      <div className="space-y-2.5 text-xs text-gray-600">
                        <InfoRow label="Student ID" value={profile.studentNumber} />
                        <InfoRow label="Email" value={profile.email} />
                        <InfoRow label="Phone" value={profile.phone || 'Not added'} />
                        <InfoRow label="Date of Birth" value={profile.dateOfBirth || 'Not added'} />
                      </div>

                      <button
                        onClick={() => setActiveTab('profile')}
                        className="mt-4 w-full rounded-xl border border-gray-200 bg-gray-50 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        View Profile Details
                      </button>
                    </div>

                    <div className="rounded-2xl bg-white p-6 border border-gray-200 shadow-sm">
                      <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-500" />
                        Academic Advisory
                      </h2>

                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        Have questions about credit requirements, course drops,
                        or exam schedules?
                      </p>

                      <Link
                        href="/contact"
                        className="w-full inline-flex items-center justify-center rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Contact Student Office
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* My Courses */}
            {activeTab === 'my-courses' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      My Enrolled Courses
                    </h1>

                    <p className="text-sm text-gray-500">
                      Manage your active and completed registrations.
                      Active Credits:{' '}
                      <span className="font-semibold text-blue-600">
                        {totalActiveCredits}
                      </span>
                    </p>
                  </div>

                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <BookOpen className="h-4 w-4" />
                    Browse Catalog to Enroll
                  </Link>
                </div>

                {enrollments.length === 0 ? (
                  <div className="rounded-2xl bg-white p-12 text-center border border-gray-200 shadow-sm">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      No Courses Enrolled
                    </h3>

                    <p className="text-sm text-gray-500 mb-6">
                      Visit the Course Catalog to choose your subjects.
                    </p>

                    <Link
                      href="/courses"
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Explore Course Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {enrollments.map((course) => (
                      <div
                        key={course.EnrollmentID}
                        className="overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >

                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-700 px-6 py-5 text-white">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                              Enrolled Subject
                            </p>

                            <p className="mt-1 text-lg font-bold">
                              {course.CourseCode}
                            </p>
                          </div>

                          <BookOpen className="h-10 w-10 text-blue-200" />
                        </div>

                        <div className="p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3 gap-2">
                              <h3 className="text-base font-bold text-gray-900">
                                {course.Title}
                              </h3>

                              <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                  course.Status === 'Active'
                                    ? 'bg-green-50 text-green-700'
                                    : course.Status === 'Completed'
                                      ? 'bg-purple-50 text-purple-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {course.Status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mb-4">
                              {course.Description || 'No description provided.'}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>
                                <span className="font-medium text-gray-700">
                                  {course.Credits} Credits
                                </span>{' '}
                                · {course.Level}
                              </p>

                              <p>Semester: {course.Semester}</p>
                            </div>

                            {course.Status === 'Active' && (
                              <button
                                onClick={() =>
                                  handleDropCourse(
                                    course.EnrollmentID,
                                    course.CourseCode
                                  )
                                }
                                disabled={droppingId === course.EnrollmentID}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                              >
                                {droppingId === course.EnrollmentID ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}

                                Drop Course
                              </button>
                            )}

                            {course.Status === 'Completed' && course.Grade && (
                              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
                                Grade: {course.Grade}
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Academic Records */}
            {activeTab === 'records' && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Academic Records
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                      View your semester-wise grades, GPA, and credit details.
                    </p>
                  </div>

                  <button
                    onClick={() => void loadDashboardData()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh Records
                  </button>
                </div>

                {/* Academic API error */}
                {academicError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />

                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        Unable to load academic records
                      </p>

                      <p className="text-sm text-red-700 mt-1">
                        {academicError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Academic Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <SummaryCard
                    label="Cumulative GPA"
                    value={displayGpa || 'Not graded'}
                    icon={<Award className="h-5 w-5 text-green-600" />}
                  />

                  <SummaryCard
                    label="Credits Attempted"
                    value={academicSummary?.totalCreditsAttempted ?? 0}
                    icon={<BookOpen className="h-5 w-5 text-blue-600" />}
                  />

                  <SummaryCard
                    label="Credits Earned"
                    value={academicSummary?.totalCreditsEarned ?? 0}
                    icon={<GraduationCap className="h-5 w-5 text-purple-600" />}
                  />

                  <SummaryCard
                    label="Graded Subjects"
                    value={academicSummary?.gradedSubjects ?? 0}
                    icon={<FileText className="h-5 w-5 text-amber-600" />}
                  />
                </div>

                {/* Semester Records */}
                {!academicError && academicSemesters.length === 0 ? (
                  <div className="rounded-2xl bg-white p-10 text-center border border-gray-200">
                    <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />

                    <h3 className="font-bold text-gray-900">
                      No Academic Records Available
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Your enrolled subjects will appear here. Grades and GPA
                      will be updated after the administrator assigns them.
                    </p>

                    <button
                      onClick={() => setActiveTab('my-courses')}
                      className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <BookOpen className="h-4 w-4" />
                      View My Courses
                    </button>
                  </div>
                ) : (
                  academicSemesters.map((semester, index) => (
                    <div
                      key={`${semester.semester}-${index}`}
                      className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
                    >

                      {/* Semester Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">
                        <div>
                          <h2 className="font-bold text-gray-900 text-lg">
                            {semester.semester}
                          </h2>

                          <p className="text-xs text-gray-500 mt-1">
                            {semester.subjects?.length || 0} Subjects
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">
                              Semester GPA
                            </p>

                            <p className="font-bold text-blue-700">
                              {semester.semesterGpa || 'Not graded'}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Earned Credits
                            </p>

                            <p className="font-bold text-green-700">
                              {semester.earnedCredits}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subject Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                              <th className="px-5 py-3">Course</th>
                              <th className="px-5 py-3">Credits</th>
                              <th className="px-5 py-3">Status</th>
                              <th className="px-5 py-3">Grade</th>
                              <th className="px-5 py-3">Grade Points</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {(semester.subjects || []).map((subject) => (
                              <tr
                                key={subject.enrollmentId}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-5 py-3">
                                  <p className="font-semibold text-gray-900">
                                    {subject.subjectName}
                                  </p>

                                  <p className="text-xs text-gray-500">
                                    {subject.courseCode}
                                  </p>
                                </td>

                                <td className="px-5 py-3">
                                  {subject.credits}
                                </td>

                                <td className="px-5 py-3">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                      subject.status === 'Active'
                                        ? 'bg-green-50 text-green-700'
                                        : subject.status === 'Completed'
                                          ? 'bg-purple-50 text-purple-700'
                                          : subject.status === 'Dropped'
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {subject.status}
                                  </span>
                                </td>

                                <td className="px-5 py-3 font-semibold">
                                  {subject.grade || 'Pending'}
                                </td>

                                <td className="px-5 py-3">
                                  {subject.gradePoints ?? '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Semester Footer */}
                      <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 text-sm">
                        <p className="text-gray-600">
                          Total Credits:{' '}
                          <strong className="text-gray-900">
                            {semester.totalCredits}
                          </strong>
                        </p>

                        <p className="text-gray-600">
                          Earned Credits:{' '}
                          <strong className="text-gray-900">
                            {semester.earnedCredits}
                          </strong>
                        </p>
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}

            {/* Student Profile — View Only */}
            {activeTab === 'profile' && (
              <div className="max-w-4xl space-y-6">

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    My Student Profile
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    View your personal and academic information registered with EduPortal.
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">

                  <div className="bg-gradient-to-r from-slate-900 to-blue-800 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-white/15 flex items-center justify-center text-2xl font-bold">
                        {profile.firstName?.charAt(0).toUpperCase() || 'S'}
                      </div>

                      <div>
                        <h2 className="text-xl font-bold">
                          {profile.fullName}
                        </h2>

                        <p className="text-sm text-blue-100">
                          {profile.studentNumber}
                        </p>

                        <p className="text-xs text-blue-200 mt-1">
                          {profile.departmentName || 'Department not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4">
                        Personal Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <ProfileField label="First Name" value={profile.firstName} />
                        <ProfileField label="Last Name" value={profile.lastName} />
                        <ProfileField label="Email Address" value={profile.email} />

                        <ProfileField
                          label="Phone Number"
                          value={profile.phone || 'Not provided'}
                          icon={<Phone className="h-3 w-3" />}
                        />

                        <ProfileField
                          label="Date of Birth"
                          value={profile.dateOfBirth || 'Not provided'}
                        />

                        <ProfileField
                          label="Residential Address"
                          value={profile.address || 'Not provided'}
                          icon={<MapPin className="h-3 w-3" />}
                        />
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4">
                        Academic Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <ProfileField
                          label="Student Number"
                          value={profile.studentNumber}
                        />

                        <ProfileField
                          label="Department"
                          value={profile.departmentName || 'Not assigned'}
                        />

                        <ProfileField
                          label="Department Code"
                          value={profile.departmentCode || 'Not assigned'}
                        />

                        <ProfileField
                          label="Enrollment Year"
                          value={String(profile.enrollmentYear || 'Not available')}
                        />

                        <ProfileField
                          label="Cumulative GPA"
                          value={displayGpa || 'Not graded'}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />

                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            Profile information is view-only
                          </p>

                          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            For corrections or updates to your personal or
                            academic information, please contact the college
                            administrator.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}

// Reusable dashboard statistic card
function StatCard({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>

        <p className="text-xl font-bold text-gray-900 truncate">
          {value}
        </p>

        <p className="text-xs text-gray-500">
          {detail}
        </p>
      </div>
    </div>
  );
}

// Reusable summary value
function SummaryValue({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl text-center">
      <p className="text-xs text-gray-500 font-medium">
        {label}
      </p>

      <p className="text-xl font-bold text-gray-900 mt-1">
        {value}
      </p>
    </div>
  );
}

// Reusable academic summary card
function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500">
          {label}
        </p>
        {icon}
      </div>

      <p className="text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

// Reusable dashboard information row
function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-gray-100">
      <span className="text-gray-400 shrink-0">
        {label}:
      </span>

      <span className="text-gray-900 text-right break-all">
        {value}
      </span>
    </div>
  );
}

// Reusable read-only profile field
function ProfileField({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>

      <p className="text-sm font-semibold text-gray-900 break-words">
        {value || 'Not provided'}
      </p>
    </div>
  );
}
