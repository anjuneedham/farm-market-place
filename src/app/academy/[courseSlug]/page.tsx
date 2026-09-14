import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, Clock, Lock } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { premiumService } from '@/lib/services/premium';
import { CardLink } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/academy/ProgressBar';
import { RelatedOnAgriLoop } from '@/components/shared/RelatedOnAgriLoop';
import { resolveRelatedRef } from '@/lib/related';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = db.academy.courseBySlug(courseSlug);
  if (!course) return {};
  return { title: course.title, description: course.summary };
}

export default async function AcademyCoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = db.academy.courseBySlug(courseSlug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const track = db.academy.tracks().find((t) => t.id === course.trackId);
  const lessons = db.academy.lessons(course.id);
  const completed = user ? db.academy.completedLessonIds(user.id) : new Set<string>();
  const progress = user ? db.academy.courseProgress(user.id, course.id) : 0;
  const hasPremiumAccess = premiumService.canAccess(user, 'premium_education');
  const related = course.relatedCategoryId
    ? resolveRelatedRef('CATEGORY', course.relatedCategoryId)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-micro text-brand-600">{track?.name}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-h1">{course.title}</h1>
        {course.access === 'PREMIUM' ? <Badge tone="premium">Premium</Badge> : null}
      </div>
      <p className="mt-3 text-ink-600">{course.summary}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-ink-500">
        <Badge tone="brand">{course.level}</Badge>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden />
          {course.estimatedMinutes} min · {lessons.length} lessons
        </span>
      </div>

      {user ? (
        <div className="mt-6">
          <ProgressBar value={progress} />
          <p className="mt-1.5 text-xs text-ink-500">{progress}% complete</p>
        </div>
      ) : null}

      {related ? (
        <div className="mt-6">
          <RelatedOnAgriLoop related={related} />
        </div>
      ) : null}

      <div className="mt-8 space-y-2">
        {lessons.map((lesson, index) => {
          const locked = lesson.access === 'PREMIUM' && !hasPremiumAccess;
          const isComplete = completed.has(lesson.id);

          return (
            <CardLink
              key={lesson.id}
              href={`/academy/${course.slug}/${lesson.slug}`}
              className="flex items-center gap-3 p-4"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete ? 'bg-positive-soft text-positive' : 'bg-brand-50 text-brand-700'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{lesson.title}</p>
                <p className="text-xs text-ink-400">{lesson.minutes} min</p>
              </div>
              {locked ? <Lock className="h-4 w-4 shrink-0 text-sun-600" aria-hidden /> : null}
            </CardLink>
          );
        })}
      </div>
    </div>
  );
}
