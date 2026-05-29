'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { Lesson } from '@/types';
import { useTeacherStore } from '@/store/teacherStore';
import { useStudentStore } from '@/store/studentStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { cn } from '@/lib/utils';
import LessonMemoModal from './LessonMemoModal';

interface LessonCardProps {
  lesson: Lesson;
  isCompact?: boolean;
  onEdit?: (lesson: Lesson) => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Attendance status → left border color override
const ATTENDANCE_BORDER_COLOR: Record<string, string> = {
  attended: '#22c55e',  // green-500
  absent:   '#ef4444',  // red-500
  late:     '#f59e0b',  // amber-500
  makeup:   '#3b82f6',  // blue-500
};

export default function LessonCard({ lesson, isCompact = false, onEdit }: LessonCardProps) {
  const teachers = useTeacherStore((s) => s.teachers);
  const students = useStudentStore((s) => s.students);
  const deleteLesson = useScheduleStore((s) => s.deleteLesson);
  const [memoOpen, setMemoOpen] = useState(false);

  const teacher = teachers.find((t) => t.id === lesson.teacherId);
  const student = students.find((s) => s.id === lesson.studentId);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lesson.id,
    data: { lesson },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const durationMinutes = timeToMinutes(lesson.endTime) - timeToMinutes(lesson.startTime);
  const heightPx = Math.max((durationMinutes / 60) * 60, 32);

  const statusDotColor =
    lesson.status === 'scheduled'
      ? 'bg-blue-500'
      : lesson.status === 'completed'
      ? 'bg-gray-400'
      : 'bg-red-500';

  // Attendance overrides the teacher color for the left border
  const borderColor = lesson.attendanceStatus
    ? ATTENDANCE_BORDER_COLOR[lesson.attendanceStatus]
    : lesson.status === 'scheduled'
    ? (teacher?.color ?? '#6366f1')
    : teacher?.color ?? '#6366f1';

  const baseColor = teacher?.color ?? '#6366f1';

  const bgStyle = {
    borderLeftColor: borderColor,
    backgroundColor: `${baseColor}1a`,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style, ...bgStyle, height: isCompact ? undefined : `${heightPx}px` }}
        className={cn(
          'group relative rounded-md border-l-4 px-2 py-1 overflow-hidden',
          'cursor-grab active:cursor-grabbing select-none',
          'transition-shadow duration-150',
          isDragging ? 'opacity-50 shadow-xl z-50' : 'hover:shadow-md',
          isCompact && 'min-h-[28px]'
        )}
        {...listeners}
        {...attributes}
      >
        {/* Status dot */}
        <div className={cn('absolute top-1.5 right-1.5 w-2 h-2 rounded-full', statusDotColor)} />

        {/* Lesson content indicator */}
        {lesson.lessonContent && !isCompact && (
          <div className="absolute bottom-1 right-1.5">
            <FileText className="w-2.5 h-2.5 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <p className="text-xs font-bold text-gray-800 truncate pr-4">
          {student?.name ?? '—'}
        </p>
        {!isCompact && (
          <p className="text-xs text-gray-500 mt-0.5">
            {lesson.startTime}〜{lesson.endTime}
          </p>
        )}

        {/* Hover actions */}
        {!isDragging && (
          <div className="absolute inset-0 flex items-center justify-end gap-1 pr-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white/60">
            {/* Memo button */}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setMemoOpen(true); }}
              className="p-1 rounded bg-white shadow-sm hover:bg-indigo-50 text-indigo-500 transition-colors"
              aria-label="メモ"
            >
              <FileText className="w-3 h-3" />
            </button>
            {onEdit && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onEdit(lesson); }}
                className="p-1 rounded bg-white shadow-sm hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="編集"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`${student?.name ?? 'このレッスン'}を削除しますか？`)) {
                  deleteLesson(lesson.id);
                }
              }}
              className="p-1 rounded bg-white shadow-sm hover:bg-red-50 text-red-500 transition-colors"
              aria-label="削除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Memo Modal */}
      {memoOpen && (
        <LessonMemoModal lessonId={lesson.id} onClose={() => setMemoOpen(false)} />
      )}
    </>
  );
}
