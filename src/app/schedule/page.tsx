'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Users, GraduationCap, Plus, Calendar } from 'lucide-react';
import MonthlyCalendar from '@/components/schedule/MonthlyCalendar';
import TeacherScheduleView from '@/components/schedule/TeacherScheduleView';
import StudentScheduleView from '@/components/schedule/StudentScheduleView';
import AddLessonModal from '@/components/schedule/AddLessonModal';
import { cn } from '@/lib/utils';

type ViewTab = 'calendar' | 'teacher' | 'student';

const TABS: { id: ViewTab; label: string; icon: React.ElementType }[] = [
  { id: 'calendar', label: 'カレンダー', icon: CalendarDays },
  { id: 'teacher', label: '講師ビュー', icon: Users },
  { id: 'student', label: '生徒ビュー', icon: GraduationCap },
];

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<ViewTab>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultModalDate, setDefaultModalDate] = useState<string | undefined>(undefined);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  function handlePrevMonth() {
    setCurrentDate((d) => subMonths(d, 1));
  }

  function handleNextMonth() {
    setCurrentDate((d) => addMonths(d, 1));
  }

  function handleResetMonth() {
    setCurrentDate(new Date());
  }

  function openAddLesson(date?: string) {
    setDefaultModalDate(date);
    setIsModalOpen(true);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-3 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">スケジュール管理</h1>
        </div>

        <button
          onClick={() => openAddLesson()}
          className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">+ レッスンを追加</span>
          <span className="sm:hidden">追加</span>
        </button>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Month navigation */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors border border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-base md:text-lg font-bold text-gray-800 min-w-[110px] md:min-w-[140px] text-center">
            {format(currentDate, 'yyyy年M月', { locale: ja })}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors border border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetMonth}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            今月
          </button>
        </div>

        {/* View tabs */}
        <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'calendar' && (
          <MonthlyCalendar
            year={year}
            month={month}
            onAddLesson={openAddLesson}
          />
        )}
        {activeTab === 'teacher' && (
          <TeacherScheduleView
            year={year}
            month={month}
            onAddLesson={openAddLesson}
          />
        )}
        {activeTab === 'student' && (
          <StudentScheduleView onAddLesson={openAddLesson} />
        )}
      </div>

      {/* Add Lesson Modal */}
      <AddLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={defaultModalDate}
      />
    </div>
  );
}
