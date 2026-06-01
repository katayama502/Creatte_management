'use client';

import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarDays, Users, GraduationCap, Plus } from 'lucide-react';
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
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-2 px-3 md:px-5 py-2.5 border-b border-gray-200 bg-white flex-wrap shrink-0">
        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-base font-bold text-gray-800 min-w-[110px] text-center select-none">
            {format(currentDate, 'yyyy年M月', { locale: ja })}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetMonth}
            className="ml-1 px-2.5 py-1 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            今日
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View tabs */}
          <div className="flex rounded border border-gray-200 bg-gray-50 divide-x divide-gray-200">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => openAddLesson()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">レッスン追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'calendar' && (
          <MonthlyCalendar
            year={year}
            month={month}
            onAddLesson={openAddLesson}
          />
        )}
        {activeTab === 'teacher' && (
          <div className="p-3 md:p-5">
            <TeacherScheduleView
              year={year}
              month={month}
              onAddLesson={openAddLesson}
            />
          </div>
        )}
        {activeTab === 'student' && (
          <div className="p-3 md:p-5">
            <StudentScheduleView onAddLesson={openAddLesson} />
          </div>
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
