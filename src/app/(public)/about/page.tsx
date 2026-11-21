// src/app/(public)/about/page.tsx
import type { Metadata } from 'next';
import { Users, Award, BookOpen, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about EduPortal — our mission, vision, history, and leadership team.',
};

const leadership = [
  {
    name: 'Dr. Richard Morgan',
    role: 'Vice Chancellor',
    desc: 'PhD in Educational Leadership from Oxford. 20+ years in academia.',
  },
  {
    name: 'Dr. Priya Sharma',
    role: 'Dean of Academics',
    desc: 'PhD in Curriculum Design. Former faculty at IIT Delhi.',
  },
  {
    name: 'Dr. John Chen',
    role: 'Dean of Research',
    desc: 'Published over 50 research papers in leading international journals.',
  },
  {
    name: 'Ms. Angela Williams',
    role: 'Registrar',
    desc: 'Masters in Public Administration. 15 years of institutional service.',
  },
];

const values = [
  { icon: <Target className="h-6 w-6 text-blue-600" />, title: 'Excellence', desc: 'We set high standards for academic achievement and personal growth.' },
  { icon: <Users className="h-6 w-6 text-blue-600" />, title: 'Inclusivity', desc: 'Every student, regardless of background, deserves a world-class education.' },
  { icon: <BookOpen className="h-6 w-6 text-blue-600" />, title: 'Innovation', desc: 'We embrace modern pedagogies and cutting-edge research.' },
  { icon: <Award className="h-6 w-6 text-blue-600" />, title: 'Integrity', desc: 'We uphold transparency, honesty, and ethical conduct in all we do.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl">About EduPortal</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Over 35 years of shaping students into leaders, innovators, and change-makers.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="rounded-2xl bg-blue-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To provide accessible, quality higher education that equips students with
                the knowledge, skills, and values to lead meaningful and productive lives
                in a diverse, dynamic global society.
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To be a globally recognized institution of excellence — a place where
                curiosity thrives, research transforms communities, and every graduate
                makes a positive impact on the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">Our History</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded in 1990, EduPortal began as a small technical college with 200 students
            and 20 faculty members. Over the decades, we expanded into a full-fledged
            university with five schools, over 200 programs, and a global alumni network of
            80,000+. In 2010, we received national accreditation. By 2020, we ranked among
            the top 50 universities in the region. Today, we continue to grow, innovate,
            and inspire the next generation of leaders.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">Core Values</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-gray-200 p-6 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  {v.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            Leadership Team
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((l) => (
              <div
                key={l.name}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {l.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-gray-900">{l.name}</h3>
                <p className="mb-2 text-sm text-blue-600 font-medium">{l.role}</p>
                <p className="text-xs text-gray-500">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
