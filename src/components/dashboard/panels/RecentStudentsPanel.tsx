'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { cn, getStatusLabel } from '@/lib/utils';
import { StudentStatus } from '@/types';

const statusColors: Record<StudentStatus, string> = {
  trial_pending: 'bg-amber-100 text-amber-700',
  trial_completed: 'bg-blue-100 text-blue-700',
  enrolled: 'bg-purple-100 text-purple-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
};

function getInitials(name: string): string {
  const parts = name.replace(/\s+/g, '');
  return parts.slice(0, 2);
}

function avatarColor(name: string): string {
  const colors = [
    'bg-indigo-200 text-indigo-700',
    'bg-orange-200 text-orange-700',
    'bg-emerald-200 text-emerald-700',
    'bg-rose-200 text-rose-700',
    'bg-sky-200 text-sky-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

export default function RecentStudentsPanel() {
  const students = useStudentStore((s) => s.students);

  const recent = [...students]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-1">
      {recent.map((student) => {
        const date = new Date(student.createdAt);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        return (
          <div
            key={student.id}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                avatarColor(student.name)
              )}
            >
              {getInitials(student.name)}
            </div>

            {/* Name & status */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
              <p className="text-xs text-gray-400">{student.nameKana}</p>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                statusColors[student.status]
              )}
            >
              {getStatusLabel(student.status)}
            </span>

            {/* Date */}
            <span className="text-xs text-gray-400 flex-shrink-0">{dateStr}</span>
          </div>
        );
      })}

      <Link
        href="/students"
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2 px-2 transition-colors"
      >
        すべての生徒を見る
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
