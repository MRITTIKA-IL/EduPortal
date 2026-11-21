// src/app/(public)/layout.tsx
import type { Metadata } from 'next';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: {
    default: 'EduPortal — Excellence in Education',
    template: '%s | EduPortal',
  },
  description:
    'EduPortal is a leading academic institution offering world-class programs in Computer Science, Business, Engineering, and more.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
