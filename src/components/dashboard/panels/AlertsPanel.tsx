'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { isToday, differenceInDays, parseISO } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  UserPlus,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { cn } from '@/lib/utils';

// ============================================================
// Alert item type
// ============================================================

interface AlertItem {
  id: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
}

// ============================================================
// Color mappings
// ============================================================

const BORDER_COLOR = {
  red: 'border-l-red-400',
  yellow: 'border-l-yellow-400',
  blue: 'border-l-blue-400',
  green: 'border-l-green-400',
};

const BADGE_COLOR = {
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
};

const ICON_COLOR = {
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
};

const HOVER_BG = {
  red: 'hover:bg-red-50',
  yellow: 'hover:bg-yellow-50',
  blue: 'hover:bg-blue-50',
  green: 'hover:bg-green-50',
};

// ============================================================
// Component
// ============================================================

export function AlertsPanel() {
  const students = useStudentStore((s) => s.students);

  const alerts = useMemo<AlertItem[]>(() => {
    const today = new Date();
    const items: AlertItem[] = [];

    // 1. 本日の体験レッスン
    const trialsToday = students.filter(
      (s) => s.trialDate && isToday(parseISO(s.trialDate))
    );
    if (trialsToday.length > 0) {
      items.push({
        id: 'trials-today',
        color: 'red',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: '本日の体験レッスン',
        count: trialsToday.length,
        href: '/students',
      });
    }

    // 2. 入会手続き待ち (trial_completed with no enrollment > 5 days)
    const awaitingEnrollment = students.filter((s) => {
      if (s.status !== 'trial_completed') return false;
      if (!s.trialDate) return true;
      return differenceInDays(today, parseISO(s.trialDate)) > 5;
    });
    if (awaitingEnrollment.length > 0) {
      items.push({
        id: 'awaiting-enrollment',
        color: 'yellow',
        icon: <Clock className="w-4 h-4" />,
        label: '入会手続き待ち',
        count: awaitingEnrollment.length,
        href: '/students',
      });
    }

    // 3. 担当講師未設定
    const noTeacher = students.filter(
      (s) =>
        (s.status === 'enrolled' || s.status === 'active') &&
        !s.teacherId
    );
    if (noTeacher.length > 0) {
      items.push({
        id: 'no-teacher',
        color: 'blue',
        icon: <UserPlus className="w-4 h-4" />,
        label: '担当講師未設定',
        count: noTeacher.length,
        href: '/students',
      });
    }

    return items;
  }, [students]);

  const allClear = alerts.length === 0;

  if (allClear) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
        <p className="text-sm font-semibold text-gray-700">本日のタスクは完了しています</p>
        <p className="text-xs text-gray-400 mt-1">新しいアクションが発生すると、ここに表示されます</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <Link
          key={alert.id}
          href={alert.href}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 border border-gray-100 bg-white',
            'transition-colors group',
            BORDER_COLOR[alert.color],
            HOVER_BG[alert.color]
          )}
        >
          <span className={cn('shrink-0', ICON_COLOR[alert.color])}>
            {alert.icon}
          </span>
          <span className="flex-1 text-sm font-medium text-gray-800">
            {alert.label}
          </span>
          <span
            className={cn(
              'shrink-0 inline-flex items-center justify-center',
              'w-6 h-6 rounded-full text-xs font-bold',
              BADGE_COLOR[alert.color]
            )}
          >
            {alert.count}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </Link>
      ))}
    </div>
  );
}

export default AlertsPanel;
