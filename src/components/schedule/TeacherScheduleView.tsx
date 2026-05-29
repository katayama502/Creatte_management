'use client';

import { useState, useCallback } from 'react';
import { useDroppable, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTeacherStore } from '@/store/teacherStore';
import { Lesson } from '@/types';
import { cn } from '@/lib/utils';
import LessonCard from './LessonCard';

// Time slots: 9:00 - 21:00 (every hour, 13 rows)
const HOUR_START = 9;
const HOUR_END = 21;
const SLOT_HEIGHT = 60; // px per hour

function timeToOffset(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - HOUR_START) * SLOT_HEIGHT + (m / 60) * SLOT_HEIGHT;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface DroppableCellProps {
  dayDate: Date;
  hour: number;
  isAvailable: boolean;
  hasConflict: boolean;
}

function DroppableCell({ dayDate, hour, isAvailable, hasConflict }: DroppableCellProps) {
  const id = `${format(dayDate, 'yyyy-MM-dd')}_${String(hour).padStart(2, '0')}:00`;
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-b border-gray-100 transition-colors',
        isOver && isAvailable && !hasConflict && 'bg-indigo-100',
        isOver && (!isAvailable || hasConflict) && 'bg-red-50',
        !isOver && !isAvailable && 'bg-gray-50/50'
      )}
      style={{ height: SLOT_HEIGHT }}
    />
  );
}

interface TeacherScheduleViewProps {
  year: number;
  month: number; // 0-indexed
  onAddLesson?: (date: string) => void;
}

export default function TeacherScheduleView({ year, month, onAddLesson }: TeacherScheduleViewProps) {
  const lessons = useScheduleStore((s) => s.lessons);
  const updateLesson = useScheduleStore((s) => s.updateLesson);
  const teachers = useTeacherStore((s) => s.teachers);

  // Start week from Monday — default to a week within the current month/year context
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const refDate = new Date(year, month, 1);
    const today = new Date();
    // Prefer today's week if it falls within the same month, else use the 1st of the month
    const base = today.getFullYear() === year && today.getMonth() === month ? today : refDate;
    return startOfWeek(base, { weekStartsOn: 1 });
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hourSlots = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  const visibleLessons = selectedTeacherId
    ? lessons.filter((l) => l.teacherId === selectedTeacherId)
    : lessons;

  const getDayLessons = useCallback(
    (day: Date) =>
      visibleLessons.filter((l) => isSameDay(new Date(l.date), day) && l.status !== 'cancelled'),
    [visibleLessons]
  );

  const activeDragLesson = activeDragId ? lessons.find((l) => l.id === activeDragId) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const lessonId = String(active.id);
    const [dateStr, newStartTime] = String(over.id).split('_');
    if (!dateStr || !newStartTime) return;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    const durationMinutes =
      timeToMinutes(lesson.endTime) - timeToMinutes(lesson.startTime);
    const newEndTime = minutesToTime(timeToMinutes(newStartTime) + durationMinutes);

    updateLesson(lessonId, {
      date: dateStr,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  }

  const totalGridHeight = (HOUR_END - HOUR_START) * SLOT_HEIGHT;

  return (
    <div className="flex gap-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Teacher sidebar */}
      <div className="w-48 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="h-14 flex items-center px-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500">講師フィルター</span>
        </div>

        <div className="flex flex-col gap-1 p-2 flex-1">
          <button
            onClick={() => setSelectedTeacherId(null)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
              selectedTeacherId === null
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0" />
            すべて
          </button>

          {teachers.map((teacher) => {
            const isActive = selectedTeacherId === teacher.id;
            // Count lessons this week for this teacher
            const weekLessonCount = weekDays.reduce(
              (sum, day) =>
                sum +
                lessons.filter(
                  (l) =>
                    l.teacherId === teacher.id &&
                    isSameDay(new Date(l.date), day) &&
                    l.status !== 'cancelled'
                ).length,
              0
            );

            return (
              <button
                key={teacher.id}
                onClick={() =>
                  setSelectedTeacherId(isActive ? null : teacher.id)
                }
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  isActive ? 'font-medium' : 'text-gray-600 hover:bg-gray-50'
                )}
                style={
                  isActive
                    ? { backgroundColor: `${teacher.color}20`, color: teacher.color }
                    : undefined
                }
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teacher.color }}
                />
                <span className="flex-1 truncate">{teacher.name}</span>
                {weekLessonCount > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${teacher.color}20`,
                      color: teacher.color,
                    }}
                  >
                    {weekLessonCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main calendar area */}
      <div className="flex-1 overflow-auto">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {format(weekStart, 'M月d日', { locale: ja })} 〜{' '}
            {format(addDays(weekStart, 6), 'M月d日(E)', { locale: ja })}
          </span>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex">
            {/* Time gutter */}
            <div className="w-14 flex-shrink-0 border-r border-gray-100">
              <div className="h-10 border-b border-gray-100" /> {/* header spacer */}
              {hourSlots.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-gray-50 flex items-start justify-end pr-2 pt-0.5"
                  style={{ height: SLOT_HEIGHT }}
                >
                  <span className="text-xs text-gray-400">{String(hour).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayLessons = getDayLessons(day);
              const dayOfWeek = day.getDay();
              const isToday = isSameDay(day, new Date());
              const dateStr = format(day, 'yyyy-MM-dd');

              // Determine available teachers for this day
              const availableTeacherIds = teachers
                .filter((t) => t.availableDays.includes(dayOfWeek))
                .map((t) => t.id);

              return (
                <div key={dateStr} className="flex-1 min-w-[100px] border-r border-gray-100 last:border-r-0">
                  {/* Day header */}
                  <div
                    className={cn(
                      'h-10 flex flex-col items-center justify-center border-b border-gray-100',
                      isToday && 'bg-indigo-50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isToday ? 'text-indigo-600' : dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-600'
                      )}
                    >
                      {format(day, 'E', { locale: ja })}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                        isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Time slot grid */}
                  <div className="relative" style={{ height: totalGridHeight }}>
                    {/* Droppable cells */}
                    {hourSlots.map((hour) => {
                      const slotTime = `${String(hour).padStart(2, '0')}:00`;
                      const isAvailable = selectedTeacherId
                        ? availableTeacherIds.includes(selectedTeacherId)
                        : availableTeacherIds.length > 0;

                      // Check conflict for selected teacher
                      const hasConflict = selectedTeacherId
                        ? dayLessons.some((l) => {
                            const lStart = timeToMinutes(l.startTime);
                            const lEnd = timeToMinutes(l.endTime);
                            const slotStart = hour * 60;
                            return l.teacherId === selectedTeacherId && lStart < slotStart + 60 && lEnd > slotStart;
                          })
                        : false;

                      return (
                        <DroppableCell
                          key={slotTime}
                          dayDate={day}
                          hour={hour}
                          isAvailable={isAvailable}
                          hasConflict={hasConflict}
                        />
                      );
                    })}

                    {/* Lesson blocks (absolute positioned) */}
                    {dayLessons.map((lesson) => {
                      const top = timeToOffset(lesson.startTime);
                      const durationMin = timeToMinutes(lesson.endTime) - timeToMinutes(lesson.startTime);
                      const height = Math.max((durationMin / 60) * SLOT_HEIGHT - 2, 20);

                      return (
                        <div
                          key={lesson.id}
                          className="absolute left-0.5 right-0.5"
                          style={{ top: top + 1, height }}
                        >
                          <LessonCard lesson={lesson} />
                        </div>
                      );
                    })}

                    {/* Add lesson click target */}
                    {onAddLesson && (
                      <button
                        onClick={() => onAddLesson(dateStr)}
                        className="absolute inset-0 w-full opacity-0 hover:opacity-100 hover:bg-indigo-50/30 transition-opacity cursor-pointer z-0"
                        aria-label={`${dateStr}にレッスン追加`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drag overlay */}
          <DragOverlay>
            {activeDragLesson && (
              <div className="w-32 opacity-90 shadow-xl">
                <LessonCard lesson={activeDragLesson} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
