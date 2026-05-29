'use client';

import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTeacherStore } from '@/store/teacherStore';
import { cn } from '@/lib/utils';

export default function StatsPanel() {
  const students = useStudentStore((s) => s.students);
  const lessons = useScheduleStore((s) => s.lessons);
  const teachers = useTeacherStore((s) => s.teachers);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const activeCount = students.filter((s) => s.status === 'active' || s.status === 'enrolled').length;
  const trialPendingCount = students.filter((s) => s.status === 'trial_pending').length;

  const monthlyLessons = lessons.filter((l) => {
    const d = new Date(l.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month && l.status !== 'cancelled';
  });

  // Teacher utilization: total lessons this month / (sum of maxStudents * 4)
  const totalCapacity = teachers.reduce((sum, t) => sum + t.maxStudents * 4, 0);
  const utilizationPct = totalCapacity > 0
    ? Math.round((monthlyLessons.length / totalCapacity) * 100)
    : 0;

  const stats = [
    {
      label: '受講中生徒数',
      value: activeCount,
      icon: Users,
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
      trend: `全${students.length}名中`,
    },
    {
      label: '今月のレッスン数',
      value: monthlyLessons.length,
      icon: Calendar,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      trend: `${month}月`,
    },
    {
      label: '体験待ち',
      value: trialPendingCount,
      icon: Clock,
      colorClass: trialPendingCount > 0 ? 'text-amber-600' : 'text-gray-400',
      bgClass: trialPendingCount > 0 ? 'bg-amber-50' : 'bg-gray-50',
      trend: trialPendingCount > 0 ? '対応が必要です' : '対応待ちなし',
      highlight: trialPendingCount > 0,
    },
    {
      label: '講師稼働率',
      value: `${utilizationPct}%`,
      icon: TrendingUp,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-50',
      trend: `今月${monthlyLessons.length}件`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={cn(
              'rounded-xl border p-4 flex flex-col gap-3 transition-shadow',
              stat.highlight
                ? 'border-amber-200 bg-amber-50 shadow-sm'
                : 'border-gray-100 bg-white shadow-sm hover:shadow-md'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              <div className={cn('p-2 rounded-lg', stat.bgClass)}>
                <Icon className={cn('w-4 h-4', stat.colorClass)} />
              </div>
            </div>
            <div>
              <span className={cn('text-3xl font-bold', stat.colorClass)}>{stat.value}</span>
            </div>
            <span className="text-xs text-gray-400">{stat.trend}</span>
          </div>
        );
      })}
    </div>
  );
}
