import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { CardLink } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Practical courses on starting a farm, crop production, livestock and farm business — free at the core, written for Jamaican conditions.',
};

export const revalidate = 3600;

export default async function AcademyPage() {
  const tracks = db.academy.tracks();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
      <h1 className="text-h1">AgriLoop Academy</h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Practical courses for Jamaican conditions. The core library — Getting Started, Crop
        Production, Livestock and Farm Business — is free for everyone, always.
      </p>

      <div className="mt-10 space-y-12">
        {tracks.map((track) => {
          const courses = db.academy.courses(track.id);
          if (courses.length === 0) return null;

          return (
            <section key={track.id}>
              <h2 className="text-h2 mb-1">{track.name}</h2>
              {track.description ? <p className="mb-4 text-ink-600">{track.description}</p> : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CardLink key={course.id} href={`/academy/${course.slug}`} className="p-5">
                    <div className="flex items-center justify-between">
                      <Badge tone="brand">{course.level}</Badge>
                      {course.access === 'PREMIUM' ? <Badge tone="premium">Premium</Badge> : null}
                    </div>
                    <h3 className="mt-3 font-semibold text-ink-900">{course.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{course.summary}</p>
                    <p className="mt-3 text-xs text-ink-400">
                      {db.academy.lessons(course.id).length} lessons · {course.estimatedMinutes} min
                    </p>
                  </CardLink>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
