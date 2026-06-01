'use client';

import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTeacherStore } from '@/store/teacherStore';
import { useStudentStore } from '@/store/studentStore';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';

const DAY_HEADERS = ['日', '月', '火', '水', '木', '金', '土'];

interface DayPopoverProps {
  date: Date;
  lessons: Lesson[];
  onClose: () => void;
  onAddLesson?: (date: string) => void;
}

function DayPopover({ date, lessons, onClose, onAddLesson }: DayPopoverProps) {
  const teachers = useTeacherStore((s) => s.teachers);
  const students = useStudentStore((s) => s.students);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="relative z-10 bg-white rounded-t-xl sm:rounded-xl shadow-xl border border-gray-100 w-full sm:w-80 max-h-[60vh] sm:max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">
            {format(date, 'M月d日(E)', { locale: ja })}
          </h3>
          <div className="flex items-center gap-2">
            {onAddLesson && (
              <button
                onClick={() => { onAddLesson(format(date, 'yyyy-MM-dd')); onClose(); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + 追加
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {lessons.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">この日のレッスンはありません</p>
          )}
          {lessons
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((lesson) => {
              const teacher = teachers.find((t) => t.id === lesson.teacherId);
              const student = students.find((s) => s.id === lesson.studentId);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-50 bg-gray-50"
                  style={{ borderLeftColor: teacher?.color ?? '#6366f1', borderLeftWidth: 3 }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{student?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{lesson.startTime}〜{lesson.endTime}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: teacher?.color ?? '#6366f1' }}
                    />
                    <span className="text-xs text-gray-500">{teacher?.name ?? '—'}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

interface MonthlyCalendarProps {
  year: number;
  month: number; // 0-indexed
  onAddLesson?: (date: string) => void;
}

export default function MonthlyCalendar({ year, month, onAddLesson }: MonthlyCalendarProps) {
  const lessons = useScheduleStore((s) => s.lessons);
  const teachers = useTeacherStore((s) => s.teachers);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const currentMonth = new Date(year, month, 1);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function getLessonsForDay(day: Date): Lesson[] {
    return lessons.filter((l) => isSameDay(new Date(l.date), day));
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2 text-center text-xs font-semibold',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayLessons = getLessonsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const dayOfWeek = day.getDay();
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={cn(
                'min-h-[56px] sm:min-h-[80px] p-1 sm:p-1.5 border-b border-r border-gray-50 text-left flex flex-col gap-1',
                'hover:bg-indigo-50 transition-colors cursor-pointer',
                !isCurrentMonth && 'bg-gray-50',
                isSelected && 'bg-indigo-50 ring-1 ring-inset ring-indigo-300',
                idx % 7 === 6 && 'border-r-0'
              )}
            >
              {/* Date number */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    !isCurrentMonth && 'text-gray-300',
                    isCurrentMonth && dayOfWeek === 0 && 'text-red-500',
                    isCurrentMonth && dayOfWeek === 6 && 'text-blue-500',
                    isCurrentMonth && dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-gray-700',
                    isTodayDate && 'bg-indigo-600 text-white font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Lesson dots/badges */}
              <div className="flex flex-wrap gap-0.5">
                {dayLessons.slice(0, 3).map((lesson) => {
                  const teacher = teachers.find((t) => t.id === lesson.teacherId);
                  return (
                    <div
                      key={lesson.id}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: teacher?.color ?? '#6366f1' }}
                      title={`${lesson.startTime}`}
                    />
                  );
                })}
                {dayLessons.length > 3 && (
                  <span className="text-xs text-gray-400 leading-none">
                    +{dayLessons.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day detail popover */}
      {selectedDay && (
        <DayPopover
          date={selectedDay}
          lessons={getLessonsForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
          onAddLesson={onAddLesson}
        />
      )}
    </div>
  );
}
