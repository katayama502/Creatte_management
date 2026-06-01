'use client';

import { format, parseISO, isToday, isPast } from 'date-fns';
import { ja } from 'date-fns/locale';
import { GripVertical, Calendar, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { cn } from '@/lib/utils';

// ─── Config ──────────────────────────────────────────────────

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
};

const CATEGORY_BADGE: Record<TaskCategory, { label: string; color: string }> = {
  kurietto: { label: 'クリエット事業', color: 'bg-indigo-100 text-indigo-700' },
  techice: { label: 'テックアイス', color: 'bg-cyan-100 text-cyan-700' },
  training: { label: '研修', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'その他', color: 'bg-gray-100 text-gray-600' },
};

// ─── Due date badge ───────────────────────────────────────────

function DueDateBadge({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return null;
  const date = parseISO(dueDate);
  const overdue = isPast(date) && !isToday(date);
  const today = isToday(date);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium',
        overdue
          ? 'bg-red-100 text-red-700'
          : today
          ? 'bg-orange-100 text-orange-700'
          : 'bg-gray-100 text-gray-500'
      )}
    >
      <Calendar className="w-3 h-3" />
      {format(date, 'M/d(E)', { locale: ja })}
    </span>
  );
}

// ─── Assignee avatar ─────────────────────────────────────────

function AssigneeAvatar({ name }: { name: string }) {
  const initial = name.charAt(0);
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0"
      title={name}
    >
      {initial}
    </span>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────

export interface TaskCardProps {
  task: Task;
  assigneeName?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  /** When true, renders without dnd-kit sortable (e.g. DragOverlay) */
  isOverlay?: boolean;
}

export default function TaskCard({
  task,
  assigneeName,
  onEdit,
  onDelete,
  isOverlay = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const isCompleted = task.status === 'completed';
  const category = CATEGORY_BADGE[task.category];

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'relative bg-white rounded-xl border border-gray-100 shadow-sm',
        'hover:shadow-md transition-shadow duration-200 group cursor-default',
        isDragging && 'opacity-50 ring-2 ring-indigo-400',
        isOverlay && 'opacity-90 rotate-1 scale-105 shadow-xl'
      )}
    >
      <div className="flex items-stretch">
        {/* Drag handle */}
        <div
          {...(isOverlay ? {} : { ...attributes, ...listeners })}
          className="flex items-center px-1.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Card body */}
        <div className="flex-1 py-3 pr-3 min-w-0">
          {/* Top row: priority dot + title + recurring */}
          <div className="flex items-start gap-2">
            <span
              className={cn(
                'mt-1 w-2 h-2 rounded-full shrink-0',
                PRIORITY_DOT[task.priority]
              )}
            />
            <span
              className={cn(
                'text-sm font-semibold text-gray-900 leading-snug flex-1 min-w-0',
                isCompleted && 'line-through text-gray-400'
              )}
              onClick={() => onEdit(task)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onEdit(task)}
            >
              {task.title}
            </span>
            {task.isRecurring && (
              <span
                title={task.recurringInterval === 'weekly' ? '毎週' : '毎月'}
                className="shrink-0 mt-0.5"
              >
                <RefreshCw className="w-3 h-3 text-gray-400" />
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-400 mt-1 truncate pl-4">
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap pl-4">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                category.color
              )}
            >
              {category.label}
            </span>
            <DueDateBadge dueDate={task.dueDate} />
          </div>

          {/* Bottom row: assignee */}
          {assigneeName && (
            <div className="flex items-center justify-end mt-2 pr-0">
              <AssigneeAvatar name={assigneeName} />
            </div>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="編集"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="削除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
