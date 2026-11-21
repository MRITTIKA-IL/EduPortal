
'use client';

import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  LogOut,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const modules = [
    {
      title: 'Student Management',
      description: 'View and manage student profiles',
      icon: Users,
      href: '/admin/dashboard/students',
    },
    {
      title: 'Course Management',
      description: 'Manage courses and course details',
      icon: BookOpen,
      href: '/admin/dashboard/courses',
    },
    {
      title: 'Academic Records',
      description: 'Manage student academic records',
      icon: GraduationCap,
      href: '/admin/dashboard/academic-records',
    },
    {
      title: 'Enrollments',
      description: 'View and manage course enrollments',
      icon: ClipboardList,
      href: '/admin/dashboard/enrollments',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">
                EduPortal
              </h1>
              <p className="text-xs text-gray-500">
                Administration Portal
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            ADMINISTRATION
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome to Admin Dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            Manage students, courses, enrollments, and academic records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <button
                key={module.title}
                type="button"
                onClick={() => router.push(module.href)}
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {module.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600">
                  Open module
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
