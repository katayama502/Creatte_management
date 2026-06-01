'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { isToday, differenceInDays, parseISO } from 'date-fns';
import {
  UserPlus,
  CalendarPlus,
  FileBarChart,
  LayoutDashboard,
  Pencil,
  Check,
  AlertTriangle,
  Clock,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import { useStudentStore } from '@/store/studentStore';
import { cn } from '@/lib/utils';

// ============================================================
// Greeting helper
// ============================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'おはようございます';
  if (hour < 18) return 'こんにちは';
  return 'お疲れ様です';
}

// ============================================================
// Alert summary card
// ============================================================

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  color: 'red' | 'yellow' | 'blue' | 'indigo';
  urgent?: boolean;
}

const CARD_STYLES = {
  red: {
    bg: 'bg-red-50 border-red-200 hover:bg-red-100',
    icon: 'text-red-500',
    count: 'text-red-700',
    label: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    icon: 'text-yellow-500',
    count: 'text-yellow-700',
    label: 'text-yellow-600',
  },
  blue: {
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    icon: 'text-blue-500',
    count: 'text-blue-700',
    label: 'text-blue-600',
  },
  indigo: {
    bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    icon: 'text-indigo-500',
    count: 'text-indigo-700',
    label: 'text-indigo-600',
  },
};

function SummaryCard({ icon, label, count, href, color }: SummaryCardProps) {
  const s = CARD_STYLES[color];
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors group',
        s.bg
      )}
    >
      <span className={cn('shrink-0', s.icon)}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium truncate', s.label)}>{label}</p>
        <p className={cn('text-xl font-bold leading-tight', s.count)}>{count}</p>
      </div>
    </Link>
  );
}

// ============================================================
// Page
// ============================================================

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const students = useStudentStore((s) => s.students);

  const dateLabel = format(new Date(), 'yyyy年M月d日(E)', { locale: ja });
  const greeting = getGreeting();

  // Compute summary counts
  const summary = useMemo(() => {
    const now = new Date();

    const trialsToday = students.filter(
      (s) => s.trialDate && isToday(parseISO(s.trialDate))
    ).length;

    const awaitingEnrollment = students.filter((s) => {
      if (s.status !== 'trial_completed') return false;
      if (!s.trialDate) return true;
      return differenceInDays(now, parseISO(s.trialDate)) > 5;
    }).length;

    const noTeacher = students.filter(
      (s) =>
        (s.status === 'enrolled' || s.status === 'active') && !s.teacherId
    ).length;

    const activeStudents = students.filter(
      (s) => s.status === 'active' || s.status === 'enrolled'
    ).length;

    return { trialsToday, awaitingEnrollment, noTeacher, activeStudents };
  }, [students]);

  const hasAlerts =
    summary.trialsToday > 0 ||
    summary.awaitingEnrollment > 0 ||
    summary.noTeacher > 0;

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ダッシュボード</h1>
          </div>
          <p className="text-sm text-gray-500">
            {greeting}　<span className="text-gray-400">{dateLabel}</span>
          </p>
        </div>

        <button
          onClick={() => setIsEditing((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isEditing
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4" />
              完了
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              レイアウトを編集
            </>
          )}
        </button>
      </div>

      {/* Alert summary cards */}
      {hasAlerts && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            要対応
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {summary.trialsToday > 0 && (
              <SummaryCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="本日の体験レッスン"
                count={summary.trialsToday}
                href="/students"
                color="red"
              />
            )}
            {summary.awaitingEnrollment > 0 && (
              <SummaryCard
                icon={<Clock className="w-5 h-5" />}
                label="手続き待ち"
                count={summary.awaitingEnrollment}
                href="/students"
                color="yellow"
              />
            )}
            {summary.noTeacher > 0 && (
              <SummaryCard
                icon={<UserCheck className="w-5 h-5" />}
                label="講師未設定"
                count={summary.noTeacher}
                href="/students"
                color="blue"
              />
            )}
            <SummaryCard
              icon={<CalendarDays className="w-5 h-5" />}
              label="在籍生徒"
              count={summary.activeStudents}
              href="/students"
              color="indigo"
            />
          </div>
        </section>
      )}

      {/* Quick action bar */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        <Link
          href="/students"
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          + 体験会登録
        </Link>

        <Link
          href="/schedule"
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <CalendarPlus className="w-4 h-4" />
          + レッスン追加
        </Link>

        <button
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <FileBarChart className="w-4 h-4" />
          今月のレポート
        </button>
      </div>

      {/* Editing hint */}
      {isEditing && (
        <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-700">
          <Pencil className="w-4 h-4 flex-shrink-0" />
          パネルをドラッグして並び替え、目のアイコンで表示/非表示を切り替えできます。
        </div>
      )}

      {/* Dashboard grid */}
      <DashboardGrid isEditing={isEditing} />
    </div>
  );
}
