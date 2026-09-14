import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { db } from '@/lib/db/repositories';
import { getCurrentUser } from '@/lib/auth/session';
import { premiumService } from '@/lib/services/premium';
import { renderLessonMarkdown } from '@/lib/markdown';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FeatureStatus } from '@/components/ui/States';
import { LessonActions } from '@/components/academy/LessonActions';
import { RelatedOnAgriLoop } from '@/components/shared/RelatedOnAgriLoop';
import { resolveRelatedRef } from '@/lib/related';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const course = db.academy.courseBySlug(courseSlug);
  if (!course) return {};
  const lesson = db.academy.lesson(course.id, lessonSlug);
  if (!lesson) return {};
  return { title: `${lesson.title} — ${course.title}` };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const course = db.academy.courseBySlug(courseSlug);
  if (!course) notFound();

  const lesson = db.academy.lesson(course.id, lessonSlug);
  if (!lesson) notFound();

  const user = await getCurrentUser();
  const lessons = db.academy.lessons(course.id);
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const previous = index > 0 ? lessons[index - 1] : undefined;
  const next = index < lessons.length - 1 ? lessons[index + 1] : undefined;

  const hasAccess = lesson.access === 'FREE' || premiumService.canAccess(user, 'premium_education');
  const progress = user ? db.academy.progressForLesson(user.id, lesson.id) : undefined;
  const related = course.relatedCategoryId
    ? resolveRelatedRef('CATEGORY', course.relatedCategoryId)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-ink-500">
        <Link href="/academy" className="hover:text-brand-600">Academy</Link>
        <span className="mx-1.5" aria-hidden>/</span>
        <Link href={`/academy/${course.slug}`} className="hover:text-brand-600">{course.title}</Link>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-h1">{lesson.title}</h1>
        {lesson.access === 'PREMIUM' ? <Badge tone="premium">Premium</Badge> : null}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
        <Clock className="h-4 w-4" aria-hidden />
        {lesson.minutes} min
      </div>

      {hasAccess ? (
        <>
          <div
            className="prose-agriloop mt-6"
            dangerouslySetInnerHTML={{ __html: renderLessonMarkdown(lesson.body) }}
          />

          {user ? (
            <div className="mt-8">
              <LessonActions
                lessonId={lesson.id}
                initiallyComplete={Boolean(progress?.completedAt)}
                initiallyBookmarked={Boolean(progress?.bookmarked)}
              />
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink-500">
              <Link href={`/signin?next=${encodeURIComponent(`/academy/${course.slug}/${lesson.slug}`)}`} className="text-brand-600 hover:underline">
                Sign in
              </Link>{' '}
              to track your progress through this course.
            </p>
          )}

          {related ? (
            <div className="mt-6">
              <RelatedOnAgriLoop related={related} />
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-ink-700">{lesson.body.split('\n')[0]}</p>
          <FeatureStatus
            title="This is a Premium lesson"
            explanation="Advanced courses, business templates and calculators are part of AgriLoop Premium."
            requirement="An active Premium subscription."
          />
          <ButtonLink href="/premium" variant="premium">
            See Premium plans
          </ButtonLink>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        {previous ? (
          <ButtonLink href={`/academy/${course.slug}/${previous.slug}`} variant="secondary" size="sm">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </ButtonLink>
        ) : (
          <span />
        )}
        {next ? (
          <ButtonLink href={`/academy/${course.slug}/${next.slug}`} size="sm">
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        ) : (
          <ButtonLink href={`/academy/${course.slug}`} size="sm" variant="secondary">
            Back to course
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
