// src/app/(public)/admissions/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Calendar, ArrowRight, FileText, Users, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admissions',
  description: 'Apply to EduPortal — learn about requirements, deadlines, and fees.',
};

const steps = [
  { step: '01', title: 'Create Account', desc: 'Register on the student portal and create your applicant profile.' },
  { step: '02', title: 'Fill Application', desc: 'Complete the online application form with your academic details.' },
  { step: '03', title: 'Upload Documents', desc: 'Upload your transcripts, certificates, and ID documents.' },
  { step: '04', title: 'Pay Application Fee', desc: 'Pay the ₹500 non-refundable application processing fee online.' },
  { step: '05', title: 'Entrance Test', desc: 'Appear for the online entrance test on your selected date.' },
  { step: '06', title: 'Receive Admission', desc: 'Get your admission letter and register for your first semester.' },
];

const requirements = [
  'Minimum 60% aggregate in 10+2 (or equivalent)',
  'Valid government-issued photo ID',
  'Official school leaving certificate',
  'Two recent passport-sized photographs',
  'Statement of Purpose (for Postgraduate programs)',
  'Two reference letters from teachers/employers (for PG)',
];

const deadlines = [
  { program: 'Undergraduate (Fall 2027)', date: 'March 31, 2027', status: 'Open' },
  { program: 'Postgraduate (Fall 2027)', date: 'April 30, 2027', status: 'Open' },
  { program: 'PhD Programs', date: 'February 28, 2027', status: 'Closed' },
];

export default function AdmissionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Admissions</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Your journey to excellence begins here. Applications for Fall 2027 are
            now open.
          </p>
          <div className="mt-8">
            <Link
              href="/student/register"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-base font-semibold text-gray-900 hover:bg-yellow-300 transition-colors"
            >
              Start Application <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">200+</p>
              <p className="text-sm text-gray-500">Programs Available</p>
            </div>
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">3,000</p>
              <p className="text-sm text-gray-500">Seats Available</p>
            </div>
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 mb-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹5L+</p>
              <p className="text-sm text-gray-500">In Scholarships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Steps */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            How to Apply
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span className="mb-4 block text-4xl font-black text-blue-100">
                  {s.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Admission Requirements
          </h2>
          <ul className="space-y-3">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500 mt-0.5" />
                <span className="text-gray-600">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deadlines */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Application Deadlines
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Program</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Deadline
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deadlines.map((d) => (
                  <tr key={d.program} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{d.program}</td>
                    <td className="px-6 py-4 text-gray-600">{d.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.status === 'Open'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/student/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
