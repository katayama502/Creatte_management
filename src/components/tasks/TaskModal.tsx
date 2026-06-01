'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Flag, Tag, Calendar, RefreshCw, User } from 'lucide-react';
import { Task, TaskPriority, TaskCategory, TaskStatus } from '@/types';
import { useTeacherStore } from '@/store/teacherStore';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  category: z.enum(['kurietto', 'techice', 'training', 'other']),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(['weekly', 'monthly']).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'medium', label: '中', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'low', label: '低', color: 'text-green-600 bg-green-50 border-green-200' },
];

const CATEGORY_OPTIONS: { value: TaskCategory; label: string }[] = [
  { value: 'kurietto', label: 'クリエット事業' },
  { value: 'techice', label: 'テックアイス' },
  { value: 'training', label: '研修' },
  { value: 'other', label: 'その他' },
];

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
];

interface TaskModalProps {
  task?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function TaskModal({ task, onSave, onClose }: TaskModalProps) {
  const teachers = useTeacherStore((s) => s.teachers);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          assigneeId: task.assigneeId ?? '',
          dueDate: task.dueDate ?? '',
          priority: task.priority,
          status: task.status,
          category: task.category,
          isRecurring: task.isRecurring ?? false,
          recurringInterval: task.recurringInterval ?? 'weekly',
          notes: task.notes ?? '',
        }
      : {
          priority: 'medium',
          status: 'pending',
          category: 'kurietto',
          isRecurring: false,
          recurringInterval: 'weekly',
        },
  });

  const isRecurring = watch('isRecurring');

  function onSubmit(values: FormValues) {
    onSave({
      title: values.title,
      description: values.description || undefined,
      assigneeId: values.assigneeId || undefined,
      dueDate: values.dueDate || undefined,
      priority: values.priority,
      status: values.status,
      category: values.category,
      isRecurring: values.isRecurring,
      recurringInterval: values.isRecurring ? values.recurringInterval : undefined,
      notes: values.notes || undefined,
    });
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {task ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="タスク名を入力"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="詳細を入力（任意）"
            />
          </div>

          {/* Priority / Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Flag className="w-3.5 h-3.5 inline mr-1" />優先度
              </label>
              <div className="flex gap-1.5">
                {PRIORITY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input type="radio" {...register('priority')} value={opt.value} className="sr-only" />
                    <span className={cn(
                      'block text-center text-xs font-medium px-2 py-1.5 rounded-lg border transition-all',
                      watch('priority') === opt.value ? opt.color + ' ring-1 ring-current' : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                    )}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-3.5 h-3.5 inline mr-1" />カテゴリ
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee / Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1" />担当者
              </label>
              <select
                {...register('assigneeId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">未割り当て</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />期限日
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('isRecurring')}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                <RefreshCw className="w-3.5 h-3.5 inline mr-1" />繰り返しタスク
              </span>
            </label>
            {isRecurring && (
              <select
                {...register('recurringInterval')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="関連情報など"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {task ? '保存する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
