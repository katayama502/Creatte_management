'use client';

import { useState } from 'react';
import { format, isAfter, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Search, Plus } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTeacherStore } from '@/store/teacherStore';
import { Student, LessonStatus } from '@/types';
import { cn, getStatusLabel, getFrequencyLabel } from '@/lib/utils';

const studentStatusColors: Record<string, string> = {
  trial_pending: 'bg-amber-100 text-amber-700',
  trial_completed: 'bg-blue-100 text-blue-700',
  enrolled: 'bg-purple-100 text-purple-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
};

const lessonStatusConfig: Record<LessonStatus, { label: string; className: string }> = {
  scheduled: { label: '予定', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '完了', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-600' },
};

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

interface StudentScheduleViewProps {
  onAddLesson?: (date?: string, studentId?: string) => void;
}

export default function StudentScheduleView({ onAddLesson }: StudentScheduleViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const students = useStudentStore((s) => s.students);
  const lessons = useScheduleStore((s) => s.lessons);
  const teachers = useTeacherStore((s) => s.teachers);

  const activeStudents = students.filter(
    (s) => s.status === 'active' || s.status === 'enrolled' || s.status === 'trial_pending'
  );

  const filtered = activeStudents.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.nameKana.includes(searchQuery)
  );

  const today = startOfDay(new Date());

  function getUpcomingLessons(student: Student) {
    return lessons
      .filter(
        (l) =>
          l.studentId === student.id &&
          isAfter(new Date(l.date), today)
      )
      .sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        return dateDiff !== 0 ? dateDiff : a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 4);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="生徒名・カナで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white"
        />
      </div>

      {/* Student list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
            {searchQuery ? '該当する生徒が見つかりません' : '表示できる生徒がいません'}
          </div>
        )}

        {filtered.map((student) => {
          const upcomingLessons = getUpcomingLessons(student);
          const teacher = teachers.find((t) => t.id === student.teacherId);

          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Student header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Color indicator from teacher */}
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: teacher?.color ?? '#e5e7eb' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{student.name}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          studentStatusColors[student.status]
                        )}
                      >
                        {getStatusLabel(student.status)}
                      </span>
                      {student.courseFrequency && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {getFrequencyLabel(student.courseFrequency)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {student.nameKana}
                      {teacher && (
                        <span className="ml-2">担当: {teacher.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onAddLesson?.(undefined, student.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  レッスン追加
                </button>
              </div>

              {/* Upcoming lessons */}
              <div className="px-4 py-3">
                {upcomingLessons.length === 0 ? (
                  <p className="text-xs text-gray-400 py-1">予定されているレッスンがありません</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {upcomingLessons.map((lesson) => {
                      const lessonTeacher = teachers.find((t) => t.id === lesson.teacherId);
                      const d = new Date(lesson.date);
                      const dayName = DAY_NAMES[d.getDay()];
                      const statusCfg = lessonStatusConfig[lesson.status];

                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs"
                          style={{
                            borderLeftColor: lessonTeacher?.color ?? '#e5e7eb',
                            borderLeftWidth: 3,
                          }}
                        >
                          <div>
                            <p className="font-semibold text-gray-700">
                              {format(d, 'M/d', { locale: ja })}({dayName})
                            </p>
                            <p className="text-gray-500">
                              {lesson.startTime}〜{lesson.endTime}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded-full font-medium',
                              statusCfg.className
                            )}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
