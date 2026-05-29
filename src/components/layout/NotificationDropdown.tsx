'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, Clock, UserPlus, CheckCircle2, X } from 'lucide-react';
import { isToday, differenceInDays, parseISO } from 'date-fns';
import { useStudentStore } from '@/store/studentStore';
import { cn } from '@/lib/utils';

// ============================================================
// Notification types
// ============================================================

type NotificationLevel = 'urgent' | 'warning' | 'info' | 'ok';

interface Notification {
  id: string;
  level: NotificationLevel;
  title: string;
  subtitle: string;
  href: string;
  actionLabel: string;
}

// ============================================================
// Level styling
// ============================================================

const LEVEL_DOT: Record<NotificationLevel, string> = {
  urgent: 'bg-red-500',
  warning: 'bg-yellow-400',
  info: 'bg-blue-500',
  ok: 'bg-green-500',
};

const LEVEL_ICON_COLOR: Record<NotificationLevel, string> = {
  urgent: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  ok: 'text-green-500',
};

const LEVEL_BG: Record<NotificationLevel, string> = {
  urgent: 'bg-red-50 border-red-100',
  warning: 'bg-yellow-50 border-yellow-100',
  info: 'bg-blue-50 border-blue-100',
  ok: 'bg-green-50 border-green-100',
};

function LevelIcon({ level }: { level: NotificationLevel }) {
  const cls = cn('w-4 h-4', LEVEL_ICON_COLOR[level]);
  switch (level) {
    case 'urgent':
      return <AlertTriangle className={cls} />;
    case 'warning':
      return <Clock className={cls} />;
    case 'info':
      return <UserPlus className={cls} />;
    case 'ok':
      return <CheckCircle2 className={cls} />;
  }
}

// ============================================================
// Props
// ============================================================

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================
// Main component
// ============================================================

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const students = useStudentStore((s) => s.students);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Build notifications dynamically from store data
  const notifications = useMemo<Notification[]>(() => {
    const today = new Date();
    const result: Notification[] = [];

    // 🔴 URGENT: trial lessons scheduled for today
    const trialsToday = students.filter(
      (s) => s.trialDate && isToday(parseISO(s.trialDate))
    );
    if (trialsToday.length > 0) {
      result.push({
        id: 'trials-today',
        level: 'urgent',
        title: `本日 体験レッスン ${trialsToday.length}件`,
        subtitle: trialsToday.map((s) => s.name).join('、'),
        href: '/students',
        actionLabel: '確認する',
      });
    }

    // 🟡 WARNING: trial_completed students with no enrollment >7 days since trialDate
    const pendingEnrollment = students.filter((s) => {
      if (s.status !== 'trial_completed') return false;
      if (!s.trialDate) return true;
      return differenceInDays(today, parseISO(s.trialDate)) > 7;
    });
    if (pendingEnrollment.length > 0) {
      result.push({
        id: 'pending-enrollment',
        level: 'warning',
        title: `入会手続き待ち ${pendingEnrollment.length}件`,
        subtitle: pendingEnrollment.map((s) => s.name).join('、'),
        href: '/students',
        actionLabel: '確認する',
      });
    }

    // 🔵 INFO: enrolled/active students with no teacherId
    const noTeacher = students.filter(
      (s) =>
        (s.status === 'enrolled' || s.status === 'active') &&
        !s.teacherId
    );
    if (noTeacher.length > 0) {
      result.push({
        id: 'no-teacher',
        level: 'info',
        title: `担当講師未設定 ${noTeacher.length}件`,
        subtitle: noTeacher.map((s) => s.name).join('、'),
        href: '/students',
        actionLabel: '設定する',
      });
    }

    // 🟢 OK: recently enrolled students (last 7 days)
    const recentlyEnrolled = students.filter((s) => {
      if (s.status !== 'enrolled' && s.status !== 'active') return false;
      if (!s.enrollmentDate) return false;
      return differenceInDays(today, parseISO(s.enrollmentDate)) <= 7;
    });
    if (recentlyEnrolled.length > 0) {
      result.push({
        id: 'recently-enrolled',
        level: 'ok',
        title: `新規入会 ${recentlyEnrolled.length}件（直近7日）`,
        subtitle: recentlyEnrolled.map((s) => s.name).join('、'),
        href: '/students',
        actionLabel: '確認する',
      });
    }

    return result;
  }, [students]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        'absolute right-0 top-full mt-2 z-50',
        'w-80 sm:w-96',
        'bg-white rounded-xl shadow-xl border border-gray-100',
        'overflow-hidden'
      )}
      role="dialog"
      aria-label="通知パネル"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-semibold text-gray-900">
            通知
            {notifications.length > 0 && (
              <span className="ml-1 text-indigo-600">({notifications.length}件)</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              すべて既読
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">未処理の通知はありません</p>
            <p className="text-xs text-gray-400 mt-1">すべてのタスクが完了しています</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <div
                  className={cn(
                    'flex items-start gap-3 px-4 py-3',
                    'border-l-4',
                    notif.level === 'urgent' && 'border-l-red-400',
                    notif.level === 'warning' && 'border-l-yellow-400',
                    notif.level === 'info' && 'border-l-blue-400',
                    notif.level === 'ok' && 'border-l-green-400'
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <LevelIcon level={notif.level} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate" title={notif.subtitle}>
                      {notif.subtitle}
                    </p>
                  </div>
                  <Link
                    href={notif.href}
                    onClick={onClose}
                    className={cn(
                      'shrink-0 text-xs font-medium px-2 py-1 rounded-md transition-colors',
                      notif.level === 'urgent' && 'text-red-600 hover:bg-red-50',
                      notif.level === 'warning' && 'text-yellow-600 hover:bg-yellow-50',
                      notif.level === 'info' && 'text-blue-600 hover:bg-blue-50',
                      notif.level === 'ok' && 'text-green-600 hover:bg-green-50'
                    )}
                  >
                    {notif.actionLabel}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Exported count hook for use in Header badge
// ============================================================

export function useNotificationCount(): number {
  const students = useStudentStore((s) => s.students);

  return useMemo(() => {
    const now = new Date();
    let count = 0;
    // Trials today
    if (students.some((s) => s.trialDate && isToday(parseISO(s.trialDate)))) count++;
    // Pending enrollment > 7 days
    if (
      students.some((s) => {
        if (s.status !== 'trial_completed') return false;
        if (!s.trialDate) return true;
        return differenceInDays(now, parseISO(s.trialDate)) > 7;
      })
    )
      count++;
    // No teacher assigned
    if (
      students.some(
        (s) => (s.status === 'enrolled' || s.status === 'active') && !s.teacherId
      )
    )
      count++;
    // Recently enrolled
    if (
      students.some((s) => {
        if (s.status !== 'enrolled' && s.status !== 'active') return false;
        if (!s.enrollmentDate) return false;
        return differenceInDays(now, parseISO(s.enrollmentDate)) <= 7;
      })
    )
      count++;
    return count;
  }, [students]);
}

export default NotificationDropdown;
