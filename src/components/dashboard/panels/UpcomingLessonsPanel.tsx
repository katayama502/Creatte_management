'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useTeacherStore } from '@/store/teacherStore';
import { cn } from '@/lib/utils';
import { LessonStatus } from '@/types';

const statusConfig: Record<LessonStatus, { label: string; className: string }> = {
  scheduled: { label: '予定', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-600' },
};

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

export default function UpcomingLessonsPanel() {
  const lessons = useScheduleStore((s) => s.lessons);
  const students = useStudentStore((s) => s.students);
  const teachers = useTeacherStore((s) => s.teachers);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const upcoming = lessons
    .filter((l) => {
      const d = new Date(l.date);
      return d >= today && d <= sevenDaysLater && l.status !== 'cancelled';
    })
    .sort((a, b) => {
      const diff = a.date.localeCompare(b.date);
      return diff !== 0 ? diff : a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-1">
      {upcoming.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">今後7日間のレッスンはありません</p>
      )}

      {upcoming.map((lesson) => {
        const student = students.find((s) => s.id === lesson.studentId);
        const teacher = teachers.find((t) => t.id === lesson.teacherId);
        const d = new Date(lesson.date);
        const dayName = DAY_NAMES[d.getDay()];
        const dateLabel = `${d.getMonth() + 1}/${d.getDate()}(${dayName}) ${lesson.startTime}`;
        const status = statusConfig[lesson.status];

        return (
          <div
            key={lesson.id}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Date + time */}
            <div className="flex-shrink-0 w-32">
              <p className="text-xs font-medium text-gray-700">{dateLabel}</p>
              <p className="text-xs text-gray-400">{lesson.startTime}〜{lesson.endTime}</p>
            </div>

            {/* Student name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {student?.name ?? '—'}
              </p>
            </div>

            {/* Teacher dot + name */}
            {teacher && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teacher.color }}
                />
                <span className="text-xs text-gray-500">{teacher.name}</span>
              </div>
            )}

            {/* Status */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                status.className
              )}
            >
              {status.label}
            </span>
          </div>
        );
      })}

      <Link
        href="/schedule"
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2 px-2 transition-colors"
      >
        スケジュールを見る
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
