'use client';

// src/app/(public)/news/page.tsx
import { useState, useEffect } from 'react';
import { Calendar, Tag, Loader2, AlertCircle } from 'lucide-react';

interface Announcement {
  AnnouncementID: number;
  Title: string;
  Slug: string;
  Summary: string;
  Category: string;
  ImageURL?: string | null;
  PublishedAt?: string | null;
  IsFeatured: boolean;
}

const fallbackPosts: Announcement[] = [
  {
    AnnouncementID: 1,
    Slug: 'welcome-fall-2026',
    Title: 'Welcome to Fall Semester 2026',
    Category: 'Academic',
    PublishedAt: '2026-11-10T00:00:00.000Z',
    Summary:
      'A warm welcome to all new and returning students for the Fall 2026 semester. This year promises exciting academic opportunities, new courses, and campus events.',
    IsFeatured: true,
  },
  {
    AnnouncementID: 2,
    Slug: 'annual-science-fair-2026',
    Title: 'Annual Science Fair – Register Now',
    Category: 'Event',
    PublishedAt: '2026-11-05T00:00:00.000Z',
    Summary:
      'The Annual Science Fair is back! Students from all departments are encouraged to participate. Submit your project proposals by December 1, 2026.',
    IsFeatured: true,
  },
  {
    AnnouncementID: 3,
    Slug: 'library-extended-hours-2026',
    Title: 'Campus Library Extended Hours',
    Category: 'News',
    PublishedAt: '2026-11-08T00:00:00.000Z',
    Summary:
      'Starting November 20th, the main campus library will operate 24/7 through the end of the examination period on December 15th.',
    IsFeatured: false,
  },
];

const categoryColors: Record<string, string> = {
  Academic: 'bg-blue-50 text-blue-700',
  Event: 'bg-green-50 text-green-700',
  News: 'bg-orange-50 text-orange-700',
  General: 'bg-gray-50 text-gray-700',
};

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Recently';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export default function NewsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch (err: unknown) {
        console.error('Failed to load announcements:', err);
        setError('Unable to load latest announcements from database. Showing archived notices.');
        setAnnouncements(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, []);

  const featured = announcements.filter((p) => p.IsFeatured);
  const regular = announcements.filter((p) => !p.IsFeatured);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl">News & Events</h1>
          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Stay informed about the latest happenings, academic events, and
            campus announcements.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading announcements from database...</p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Featured Posts */}
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-6 text-2xl font-bold text-gray-900">Featured</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {featured.map((post) => (
                      <div
                        key={post.AnnouncementID}
                        className="rounded-2xl bg-white border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3 flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.Category] || 'bg-blue-50 text-blue-700'}`}>
                            <Tag className="h-3 w-3" /> {post.Category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" /> {formatDate(post.PublishedAt)}
                          </span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {post.Title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{post.Summary}</p>
                        <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700">
                          Read more →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Posts */}
              <h2 className="mb-6 text-2xl font-bold text-gray-900">All Announcements</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {regular.length === 0 && featured.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    No announcements published yet.
                  </div>
                ) : (
                  (regular.length > 0 ? regular : featured).map((post) => (
                    <div
                      key={post.AnnouncementID}
                      className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.Category] || 'bg-blue-50 text-blue-700'}`}>
                          <Tag className="h-3 w-3" /> {post.Category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" /> {formatDate(post.PublishedAt)}
                        </span>
                      </div>
                      <h3 className="mb-2 text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {post.Title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {post.Summary}
                      </p>
                      <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Read more →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
