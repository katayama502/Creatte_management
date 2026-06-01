'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, isToday, isPast, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  CheckSquare,
  Plus,
  Flag,
  Clock,
  AlertTriangle,
  RefreshCw,
  Filter,
  Check,
  Circle,
  PlayCircle,
  Trash2,
  Pencil,
  Tag,
  User,
} from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { useTeacherStore } from '@/store/teacherStore';
import { Task, TaskStatus, TaskCategory, TaskPriority } from '@/types';
import TaskModal from '@/components/tasks/TaskModal';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  high: { label: '高', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
  medium: { label: '中', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  low: { label: '低', color: 'text-green-700 bg-green-50 border-green-200', dot: 'bg-green-500' },
};

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; color: string }> = {
  kurietto: { label: 'クリエット事業', color: 'bg-indigo-100 text-indigo-700' },
  techice: { label: 'テックアイス', color: 'bg-cyan-100 text-cyan-700' },
  training: { label: '研修', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'その他', color: 'bg-gray-100 text-gray-600' },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: {
    label: '未着手',
    icon: <Circle className="w-4 h-4" />,
    color: 'text-gray-400',
  },
  in_progress: {
    label: '進行中',
    icon: <PlayCircle className="w-4 h-4" />,
    color: 'text-blue-500',
  },
  completed: {
    label: '完了',
    icon: <Check className="w-4 h-4" />,
    color: 'text-green-500',
  },
};

// ─── Due date badge ───────────────────────────────────────────

function DueDateBadge({ dueDate }: { dueDate?: string }) {
  if (!dueDate) return null;
  const date = parseISO(dueDate);
  const overdue = isPast(date) && !isToday(date);
  const today = isToday(date);
  const soon = !overdue && !today && differenceInDays(date, new Date()) <= 3;

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
      overdue ? 'bg-red-100 text-red-700' :
      today ? 'bg-orange-100 text-orange-700' :
      soon ? 'bg-yellow-100 text-yellow-700' :
      'bg-gray-100 text-gray-500'
    )}>
      <Clock className="w-3 h-3" />
      {overdue && '期限超過 '}
      {format(date, 'M/d(E)', { locale: ja })}
    </span>
  );
}

// ─── Task row ────────────────────────────────────────────────

interface TaskRowProps {
  task: Task;
  assigneeName?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

function TaskRow({ task, assigneeName, onEdit, onDelete, onToggleStatus }: TaskRowProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const category = CATEGORY_CONFIG[task.category];
  const status = STATUS_CONFIG[task.status];
  const isCompleted = task.status === 'completed';

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors group',
      isCompleted && 'opacity-60'
    )}>
      {/* Status toggle */}
      <button
        onClick={() => onToggleStatus(task)}
        className={cn('mt-0.5 shrink-0 transition-colors', status.color, 'hover:scale-110')}
        aria-label="ステータス変更"
      >
        {status.icon}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-sm font-medium text-gray-900',
            isCompleted && 'line-through text-gray-400'
          )}>
            {task.title}
          </span>
          {task.isRecurring && (
            <span className="text-gray-400" title={task.recurringInterval === 'weekly' ? '毎週' : '毎月'}>
              <RefreshCw className="w-3 h-3" />
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority */}
          <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', priority.color)}>
            <Flag className="w-2.5 h-2.5 inline mr-0.5" />{priority.label}
          </span>

          {/* Category */}
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', category.color)}>
            {category.label}
          </span>

          {/* Due date */}
          <DueDateBadge dueDate={task.dueDate} />

          {/* Assignee */}
          {assigneeName && (
            <span className="text-xs text-gray-400 flex items-center gap-0.5">
              <User className="w-3 h-3" />{assigneeName}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, setTaskStatus } = useTaskStore();
  const teachers = useTeacherStore((s) => s.teachers);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const getAssigneeName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name : undefined;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!showCompleted && t.status === 'completed') return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterStatus, filterCategory, filterPriority, showCompleted]);

  // Summary counts
  const overdue = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const d = parseISO(t.dueDate);
    return isPast(d) && !isToday(d);
  }).length;

  const dueToday = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return isToday(parseISO(t.dueDate));
  }).length;

  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  function handleSave(data: Omit<Task, 'id' | 'createdAt'>) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setModalOpen(false);
    setEditingTask(undefined);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleToggleStatus(task: Task) {
    const next: TaskStatus =
      task.status === 'pending' ? 'in_progress' :
      task.status === 'in_progress' ? 'completed' : 'pending';
    setTaskStatus(task.id, next);
  }

  // Group by status for display
  const pending = filteredTasks.filter((t) => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">タスク管理</h1>
            </div>
            <p className="text-sm text-gray-500">全 {tasks.filter(t => t.status !== 'completed').length} 件の未完了タスク</p>
          </div>
          <button
            onClick={() => { setEditingTask(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            タスクを追加
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {overdue > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <AlertTriangle className="w-3 h-3" />期限超過 {overdue}件
            </span>
          )}
          {dueToday > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              <Clock className="w-3 h-3" />本日期限 {dueToday}件
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <PlayCircle className="w-3 h-3" />進行中 {inProgress}件
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Check className="w-3 h-3" />完了 {completedCount}件
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 flex-wrap">
        <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />絞り込み
        </span>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">すべてのカテゴリ</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">すべての優先度</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600"
          />
          完了済みを表示
        </label>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <CheckSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">タスクがありません</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              最初のタスクを追加する
            </button>
          </div>
        ) : (
          <>
            {/* In Progress */}
            {inProgressTasks.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" />進行中 ({inProgressTasks.length})
                </h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {inProgressTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      assigneeName={getAssigneeName(task.assigneeId)}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Circle className="w-3.5 h-3.5" />未着手 ({pending.length})
                </h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {pending.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      assigneeName={getAssigneeName(task.assigneeId)}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed */}
            {showCompleted && completedTasks.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />完了 ({completedTasks.length})
                </h2>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {completedTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      assigneeName={getAssigneeName(task.assigneeId)}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
}
