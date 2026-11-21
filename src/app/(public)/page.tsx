
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Calendar,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Building2,
  Globe,
} from 'lucide-react';

type Course = {
  code: string;
  title: string;
  dept: string;
  credits: number;
};

type Announcement = {
  date: string;
  category: string;
  title: string;
  summary: string;
};

const stats = [
  { value: '12,000+', label: 'Students Enrolled', icon: Users },
  { value: '200+', label: 'Courses Offered', icon: BookOpen },
  { value: '500+', label: 'Expert Faculty', icon: Award },
  { value: '35+', label: 'Years of Excellence', icon: GraduationCap },
];

const fallbackCourses: Course[] = [
  { code: 'CS101', title: 'Introduction to Programming', dept: 'Computer Science', credits: 3 },
  { code: 'BA101', title: 'Principles of Management', dept: 'Business Administration', credits: 3 },
  { code: 'ENG101', title: 'Engineering Mathematics I', dept: 'Engineering', credits: 4 },
];

const courseImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
];

const fallbackAnnouncements: Announcement[] = [
  {
    date: 'Nov 10, 2026',
    category: 'Academic',
    title: 'Welcome to Fall Semester 2026',
    summary: 'A warm welcome to all new and returning students for the Fall 2026 semester.',
  },
  {
    date: 'Nov 8, 2026',
    category: 'News',
    title: 'Campus Library Extended Hours',
    summary: 'The library will be open 24/7 during the upcoming examination period.',
  },
  {
    date: 'Nov 5, 2026',
    category: 'Event',
    title: 'Annual Science Fair – Register Now',
    summary: 'Registration is open. Submit your project proposals by December 1, 2026.',
  },
];

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>(fallbackCourses);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(fallbackAnnouncements);
  const [courseIndex, setCourseIndex] = useState(0);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.courses?.length) {
          setCourses(
            data.courses.map(
              (c: {
                CourseCode: string;
                Title: string;
                DepartmentName: string;
                Credits: number;
              }) => ({
                code: c.CourseCode,
                title: c.Title,
                dept: c.DepartmentName || 'General',
                credits: c.Credits,
              })
            )
          );
        }
      })
      .catch((err) => console.error('Error fetching courses:', err));

    fetch('/api/announcements?limit=3')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcements?.length) {
          setAnnouncements(
            data.announcements.map(
              (a: {
                PublishedAt: string;
                Category: string;
                Title: string;
                Summary: string;
              }) => ({
                date: formatDate(a.PublishedAt),
                category: a.Category,
                title: a.Title,
                summary: a.Summary,
              })
            )
          );
        }
      })
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  const visibleCourses = Array.from(
    { length: Math.min(3, courses.length) },
    (_, i) => courses[(courseIndex + i) % courses.length]
  );

  const previousCourses = () => {
    setCourseIndex((current) => (current - 1 + courses.length) % courses.length);
  };

  const nextCourses = () => {
    setCourseIndex((current) => (current + 1) % courses.length);
  };

  return (
    <main className="bg-white text-slate-800">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#10294b]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-200">
              <GraduationCap size={17} />
              Admissions Open — Fall 2027
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn Today.
              <span className="block text-sky-300">Lead Tomorrow.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Discover your potential with quality education, experienced
              faculty and opportunities designed to prepare you for the future.
            </p>

            
<div className="mt-9 flex flex-wrap gap-4">
  <Link
    href="/student/login"
    className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-6 py-3.5 font-semibold text-[#10294b] transition hover:bg-sky-300"
  >
    Student Login
  </Link>

  <Link
    href="/admin/login"
    className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
  >
    Admin Login
  </Link>

  <Link
    href="/admissions"
    className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
  >
    Apply Now
  </Link>

  <Link
    href="/courses"
    className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
  >
    Explore Courses
  </Link>
</div>


            <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Award size={18} className="text-sky-300" /> Quality Education
              </span>
              <span className="flex items-center gap-2">
                <Globe size={18} className="text-sky-300" /> Global Opportunities
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-sky-300/10 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200"
              alt="Modern university campus"
              className="relative h-[350px] w-full rounded-2xl object-cover shadow-2xl sm:h-[450px]"
            />
            <div className="absolute -bottom-5 -left-4 rounded-xl bg-white p-5 shadow-xl sm:left-6">
              <p className="text-2xl font-bold text-[#10294b]">12,000+</p>
              <p className="text-sm text-slate-500">Students building their future</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 sm:grid-cols-4 lg:px-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="mx-auto mb-3 text-sky-600" size={25} />
                <p className="text-3xl font-bold text-[#10294b]">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-700">
                Explore learning
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#10294b] sm:text-4xl">
                Discover Our Courses
              </h2>
              <p className="mt-3 text-slate-500">
                Find the right program to shape your future.
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={previousCourses}
                aria-label="Previous courses"
                className="rounded-full border border-slate-300 bg-white p-3 text-[#10294b] transition hover:bg-sky-100"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextCourses}
                aria-label="Next courses"
                className="rounded-full border border-slate-300 bg-white p-3 text-[#10294b] transition hover:bg-sky-100"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((course) => {
              const originalIndex = courses.findIndex(
                (item) => item.code === course.code
              );

              return (
                <article
                  key={course.code}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={courseImages[originalIndex % courseImages.length]}
                    alt={course.dept}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-6">
                    <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                      {course.dept}
                    </span>

                    <h3 className="mt-4 text-xl font-semibold text-[#10294b]">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {course.code} · {course.credits} Credits
                    </p>

                    <Link
                      href="/courses"
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-sky-700 hover:text-sky-900"
                    >
                      Learn more <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-3 sm:hidden">
            <button onClick={previousCourses} aria-label="Previous courses" className="rounded-full border p-3">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextCourses} aria-label="Next courses" className="rounded-full border p-3">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-lg border border-[#10294b] px-6 py-3 font-semibold text-[#10294b] transition hover:bg-[#10294b] hover:text-white"
            >
              View All Courses <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why EduPortal */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-700">
              The EduPortal advantage
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[#10294b] sm:text-4xl">
              An Education That Moves You Forward
            </h2>
            <p className="mt-4 text-slate-500">
              We bring together academic excellence, practical learning and
              dedicated guidance.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {[
              {
                icon: Award,
                title: 'Recognized Programs',
                description: 'Build a strong foundation through structured academic programs.',
              },
              {
                icon: Users,
                title: 'Experienced Faculty',
                description: 'Learn with guidance from dedicated and knowledgeable educators.',
              },
              {
                icon: Building2,
                title: 'Modern Learning',
                description: 'Explore learning experiences designed for changing industries.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-sky-50/70 p-8 transition hover:shadow-md"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#10294b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-700">
              Campus updates
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#10294b] sm:text-4xl">
              Latest News & Events
            </h2>
            <p className="mt-3 text-slate-500">
              Stay connected with the latest happenings at EduPortal.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item, index) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <img
                  src={[
                    'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
                    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                  ][index % 3]}
                  alt="Campus news"
                  className="h-44 w-full object-cover"
                />

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-800">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar size={13} /> {item.date}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[#10294b]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {item.summary}
                  </p>

                  <Link
                    href="/news"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900"
                  >
                    Read more <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#10294b] py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <GraduationCap className="mx-auto mb-5 text-sky-300" size={42} />
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your Future Starts Here
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Take the next step towards your goals. Explore our programs and
            discover the opportunities waiting for you.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/admissions"
              className="rounded-lg bg-sky-400 px-7 py-3.5 font-semibold text-[#10294b] transition hover:bg-sky-300"
            >
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
