'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTeacherStore } from '@/store/teacherStore';
import { useStudentStore } from '@/store/studentStore';
import { cn } from '@/lib/utils';

const schema = z.object({
  teacherId: z.string().min(1, '講師を選択してください'),
  studentId: z.string().min(1, '生徒を選択してください'),
  date: z.string().min(1, '日付を入力してください'),
  startTime: z.string().min(1, '開始時間を選択してください'),
  endTime: z.string().min(1, '終了時間を選択してください'),
  isRecurring: z.boolean(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// Generate time options at 30-min intervals from 9:00 to 20:30
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 9; h <= 20; h++) {
    options.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 20 || true) options.push(`${String(h).padStart(2, '0')}:30`);
  }
  // Remove times after 20:30
  return options.filter((t) => t <= '20:30');
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

const TIME_OPTIONS = generateTimeOptions();

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export default function AddLessonModal({ isOpen, onClose, defaultDate }: AddLessonModalProps) {
  const addLesson = useScheduleStore((s) => s.addLesson);
  const teachers = useTeacherStore((s) => s.teachers);
  const students = useStudentStore((s) => s.students);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      teacherId: '',
      studentId: '',
      date: defaultDate ?? '',
      startTime: '10:00',
      endTime: '11:00',
      isRecurring: false,
      notes: '',
    },
  });

  const selectedTeacherId = watch('teacherId');
  const startTime = watch('startTime');

  // Filter students by selected teacher
  const teacherStudents = selectedTeacherId
    ? students.filter(
        (s) =>
          s.teacherId === selectedTeacherId &&
          (s.status === 'active' || s.status === 'enrolled')
      )
    : students.filter((s) => s.status === 'active' || s.status === 'enrolled');

  // Auto-update endTime when startTime changes
  useEffect(() => {
    if (startTime) {
      const auto = addMinutes(startTime, 60);
      if (auto <= '21:00') {
        setValue('endTime', auto);
      }
    }
  }, [startTime, setValue]);

  // Reset studentId when teacher changes
  useEffect(() => {
    setValue('studentId', '');
  }, [selectedTeacherId, setValue]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        teacherId: '',
        studentId: '',
        date: defaultDate ?? '',
        startTime: '10:00',
        endTime: '11:00',
        isRecurring: false,
        notes: '',
      });
    }
  }, [isOpen, defaultDate, reset]);

  const onSubmit = (data: FormValues) => {
    addLesson({
      teacherId: data.teacherId,
      studentId: data.studentId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled',
      isRecurring: data.isRecurring,
      notes: data.notes ?? undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">レッスンを追加</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
          {/* Teacher select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">担当講師 <span className="text-red-500">*</span></label>
            <select
              {...register('teacherId')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow',
                errors.teacherId ? 'border-red-400' : 'border-gray-200'
              )}
            >
              <option value="">講師を選択</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.subjects.join(' / ')})
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="text-xs text-red-500">{errors.teacherId.message}</p>
            )}
          </div>

          {/* Student select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">生徒 <span className="text-red-500">*</span></label>
            <select
              {...register('studentId')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow',
                errors.studentId ? 'border-red-400' : 'border-gray-200'
              )}
            >
              <option value="">生徒を選択</option>
              {teacherStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-xs text-red-500">{errors.studentId.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">日付 <span className="text-red-500">*</span></label>
            <input
              type="date"
              {...register('date')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow',
                errors.date ? 'border-red-400' : 'border-gray-200'
              )}
            />
            {errors.date && (
              <p className="text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">開始時間 <span className="text-red-500">*</span></label>
              <select
                {...register('startTime')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow',
                  errors.startTime ? 'border-red-400' : 'border-gray-200'
                )}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">終了時間 <span className="text-red-500">*</span></label>
              <select
                {...register('endTime')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow',
                  errors.endTime ? 'border-red-400' : 'border-gray-200'
                )}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="21:00">21:00</option>
              </select>
            </div>
          </div>

          {/* Recurring */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              {...register('isRecurring')}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              毎月繰り返す
            </span>
          </label>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">備考</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="備考・連絡事項など（任意）"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              追加する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
