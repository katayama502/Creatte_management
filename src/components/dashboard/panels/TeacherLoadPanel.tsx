'use client';

import { useTeacherStore } from '@/store/teacherStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { cn } from '@/lib/utils';

export default function TeacherLoadPanel() {
  const teachers = useTeacherStore((s) => s.teachers);
  const lessons = useScheduleStore((s) => s.lessons);
  const students = useStudentStore((s) => s.students);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className="flex flex-col gap-4">
      {teachers.map((teacher) => {
        const monthlyLessons = lessons.filter((l) => {
          const d = new Date(l.date);
          return (
            l.teacherId === teacher.id &&
            d.getFullYear() === year &&
            d.getMonth() + 1 === month &&
            l.status !== 'cancelled'
          );
        });

        const assignedStudents = students.filter(
          (s) => s.teacherId === teacher.id && (s.status === 'active' || s.status === 'enrolled')
        );

        const capacity = teacher.maxStudents * 4;
        const utilization = capacity > 0 ? Math.min((monthlyLessons.length / capacity) * 100, 100) : 0;

        const utilizationColor =
          utilization >= 80
            ? 'bg-red-500'
            : utilization >= 60
            ? 'bg-amber-500'
            : 'bg-emerald-500';

        return (
          <div key={teacher.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teacher.color }}
                />
                <span className="text-sm font-medium text-gray-800">{teacher.name}</span>
                <span className="text-xs text-gray-400">{teacher.subjects.join(' / ')}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{monthlyLessons.length}件</span>
                <span>{assignedStudents.length}名</span>
                <span className={cn(
                  'font-semibold',
                  utilization >= 80 ? 'text-red-600' : utilization >= 60 ? 'text-amber-600' : 'text-emerald-600'
                )}>
                  {Math.round(utilization)}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={cn('h-2 rounded-full transition-all duration-500', utilizationColor)}
                style={{ width: `${utilization}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>今月 {monthlyLessons.length}件 / 上限 {capacity}件</span>
              <span>担当生徒 {assignedStudents.length} / {teacher.maxStudents}名</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
