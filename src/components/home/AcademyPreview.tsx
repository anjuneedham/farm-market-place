import { ArrowRight, Clock } from 'lucide-react';
import { CardLink } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AcademyCourse } from '@/lib/types';

export function AcademyPreview({ courses }: { courses: AcademyCourse[] }) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6">
      <SectionHeader
        eyebrow="AgriLoop Academy"
        title="Practical courses, free at the core"
        description="Starting a farm, growing specific crops, raising livestock, and running a farm business — written for Jamaican conditions."
        action={
          <ButtonLink href="/academy" variant="secondary" size="sm">
            Visit the Academy
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CardLink key={course.id} href={`/academy/${course.slug}`} className="p-5">
            <div className="flex items-center justify-between">
              <Badge tone="brand">{course.level}</Badge>
              {course.access === 'PREMIUM' ? <Badge tone="premium">Premium</Badge> : null}
            </div>
            <h3 className="mt-3 font-semibold text-ink-900">{course.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{course.summary}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-ink-400">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {course.estimatedMinutes} min
            </div>
          </CardLink>
        ))}
      </div>
    </section>
  );
}
