'use client';

import Link from 'next/link';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckSquare, AlertTriangle, Clock, Circle, PlayCircle, ArrowRight } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types';

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
};

export default function TasksPanel() {
  const tasks = useTaskStore((s) => s.tasks);

  const active = tasks.filter((t) => t.status !== 'completed');
  const overdue = active.filter((t) => t.dueDate && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate)));
  const dueToday = active.filter((t) => t.dueDate && isToday(parseISO(t.dueDate)));
  const inProgress = active.filter((t) => t.status === 'in_progress');

  // Show top 5 active tasks (overdue first, then by priority)
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const displayed = [...active]
    .sort((a, b) => {
      const aOverdue = a.dueDate && isPast(parseISO(a.dueDate)) && !isToday(parseISO(a.dueDate));
      const bOverdue = b.dueDate && isPast(parseISO(b.dueDate)) && !isToday(parseISO(b.dueDate));
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    })
    .slice(0, 5);

  if (active.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-300">
        <CheckSquare className="w-10 h-10 mb-2" />
        <p className="text-sm">未完了タスクはありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex gap-3">
        {overdue.length > 0 && (
          <div className="flex-1 flex items-center gap-1.5 bg-red-50 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-700">{overdue.length}件 期限超過</span>
          </div>
        )}
        {dueToday.length > 0 && (
          <div className="flex-1 flex items-center gap-1.5 bg-orange-50 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-orange-700">本日 {dueToday.length}件</span>
          </div>
        )}
        {inProgress.length > 0 && (
          <div className="flex-1 flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-2">
            <PlayCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-blue-700">進行中 {inProgress.length}件</span>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="divide-y divide-gray-50">
        {displayed.map((task) => {
          const isOverdue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
          return (
            <div key={task.id} className="flex items-center gap-2.5 py-2">
              <span className={cn('w-2 h-2 rounded-full shrink-0', PRIORITY_DOT[task.priority])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{task.title}</p>
                {task.dueDate && (
                  <p className={cn('text-xs', isOverdue ? 'text-red-600 font-medium' : 'text-gray-400')}>
                    {isOverdue ? '期限超過 ' : ''}
                    {format(parseISO(task.dueDate), 'M/d(E)', { locale: ja })}
                  </p>
                )}
              </div>
              {task.status === 'in_progress' && (
                <PlayCircle className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              {task.status === 'pending' && (
                <Circle className="w-4 h-4 text-gray-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/tasks"
        className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 pt-1 font-medium"
      >
        すべてのタスクを見る <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
