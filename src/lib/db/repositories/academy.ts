import { data, mutate } from '../datasource';
import type { AcademyCourse, AcademyTrack, Lesson, LessonProgress } from '@/lib/types';
import { newId, nowIso } from './common';

export const academy = {
  tracks(): AcademyTrack[] {
    return [...data().academyTracks].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  trackBySlug(slug: string): AcademyTrack | undefined {
    return data().academyTracks.find((t) => t.slug === slug);
  },

  courses(trackId?: string, includeUnpublished = false): AcademyCourse[] {
    return data()
      .academyCourses.filter(
        (course) =>
          (includeUnpublished || course.isPublished) && (!trackId || course.trackId === trackId),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  courseBySlug(slug: string): AcademyCourse | undefined {
    return data().academyCourses.find((c) => c.slug === slug);
  },

  courseById(id: string): AcademyCourse | undefined {
    return data().academyCourses.find((c) => c.id === id);
  },

  lessons(courseId: string): Lesson[] {
    return data()
      .lessons.filter((l) => l.courseId === courseId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  lesson(courseId: string, slug: string): Lesson | undefined {
    return data().lessons.find((l) => l.courseId === courseId && l.slug === slug);
  },

  lessonById(id: string): Lesson | undefined {
    return data().lessons.find((l) => l.id === id);
  },

  totalLessons(): number {
    return data().lessons.length;
  },

  freeCourseCount(): number {
    return data().academyCourses.filter((c) => c.isPublished && c.access === 'FREE').length;
  },

  progressFor(userId: string): LessonProgress[] {
    return data().lessonProgress.filter((p) => p.userId === userId);
  },

  progressForLesson(userId: string, lessonId: string): LessonProgress | undefined {
    return data().lessonProgress.find((p) => p.userId === userId && p.lessonId === lessonId);
  },

  completedLessonIds(userId: string): Set<string> {
    return new Set(
      data()
        .lessonProgress.filter((p) => p.userId === userId && p.completedAt)
        .map((p) => p.lessonId),
    );
  },

  bookmarkedLessons(userId: string): Lesson[] {
    const ids = new Set(
      data()
        .lessonProgress.filter((p) => p.userId === userId && p.bookmarked)
        .map((p) => p.lessonId),
    );
    return data().lessons.filter((l) => ids.has(l.id));
  },

  setProgress(
    userId: string,
    lessonId: string,
    patch: { completed?: boolean; bookmarked?: boolean },
  ): LessonProgress {
    return mutate((db) => {
      let progress = db.lessonProgress.find((p) => p.userId === userId && p.lessonId === lessonId);

      if (!progress) {
        progress = {
          id: newId('progress'),
          userId,
          lessonId,
          bookmarked: false,
          updatedAt: nowIso(),
        };
        db.lessonProgress.push(progress);
      }

      if (patch.completed !== undefined) {
        progress.completedAt = patch.completed ? nowIso() : undefined;
      }
      if (patch.bookmarked !== undefined) {
        progress.bookmarked = patch.bookmarked;
      }
      progress.updatedAt = nowIso();

      return progress;
    });
  },

  /** Course completion percentage for a learner, 0–100. */
  courseProgress(userId: string, courseId: string): number {
    const lessons = this.lessons(courseId);
    if (lessons.length === 0) return 0;
    const completed = this.completedLessonIds(userId);
    const done = lessons.filter((l) => completed.has(l.id)).length;
    return Math.round((done / lessons.length) * 100);
  },

  setCoursePublished(courseId: string, isPublished: boolean): AcademyCourse | undefined {
    return mutate((db) => {
      const course = db.academyCourses.find((c) => c.id === courseId);
      if (!course) return undefined;
      course.isPublished = isPublished;
      return course;
    });
  },

  setCourseAccess(courseId: string, access: AcademyCourse['access']): AcademyCourse | undefined {
    return mutate((db) => {
      const course = db.academyCourses.find((c) => c.id === courseId);
      if (!course) return undefined;
      course.access = access;
      return course;
    });
  },
};
