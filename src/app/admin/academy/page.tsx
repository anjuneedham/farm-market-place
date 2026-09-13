import type { Metadata } from 'next';
import { db } from '@/lib/db/repositories';
import { Badge } from '@/components/ui/Badge';
import { AdminActionButton } from '@/components/admin/ActionButton';
import { setCoursePublishedAction } from '../actions';

export const metadata: Metadata = { title: 'Academy — Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminAcademyPage() {
  const tracks = db.academy.tracks();

  return (
    <div>
      <h1 className="text-h1 mb-6">Academy content</h1>

      <div className="space-y-8">
        {tracks.map((track) => {
          const courses = db.academy.courses(track.id, true);
          if (courses.length === 0) return null;

          return (
            <section key={track.id}>
              <h2 className="text-h2 mb-3">{track.name}</h2>
              <div className="divide-y divide-line rounded-lg border border-line bg-surface">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-ink-900">{course.title}</p>
                        {course.access === 'PREMIUM' ? <Badge tone="premium">Premium</Badge> : null}
                        {!course.isPublished ? <Badge tone="neutral">Unpublished</Badge> : null}
                      </div>
                      <p className="text-xs text-ink-400">{db.academy.lessons(course.id).length} lessons</p>
                    </div>
                    {course.isPublished ? (
                      <AdminActionButton label="Unpublish" variant="danger" action={setCoursePublishedAction} args={[course.id, false]} />
                    ) : (
                      <AdminActionButton label="Publish" action={setCoursePublishedAction} args={[course.id, true]} />
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
