'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Calendar, Clock, User, AlignLeft } from 'lucide-react';
import { FacilityReservation, FacilityColor } from '@/types';
import { cn } from '@/lib/utils';

const COLOR_OPTIONS: { value: FacilityColor; bg: string; label: string }[] = [
  { value: 'indigo', bg: 'bg-indigo-500', label: 'インジゴ' },
  { value: 'blue',   bg: 'bg-blue-500',   label: 'ブルー' },
  { value: 'cyan',   bg: 'bg-cyan-500',   label: 'シアン' },
  { value: 'teal',   bg: 'bg-teal-500',   label: 'ティール' },
  { value: 'green',  bg: 'bg-green-500',  label: 'グリーン' },
  { value: 'yellow', bg: 'bg-yellow-500', label: 'イエロー' },
  { value: 'orange', bg: 'bg-orange-500', label: 'オレンジ' },
  { value: 'red',    bg: 'bg-red-500',    label: 'レッド' },
  { value: 'pink',   bg: 'bg-pink-500',   label: 'ピンク' },
  { value: 'purple', bg: 'bg-purple-500', label: 'パープル' },
];

// Generate 30-min slots
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}
const TIME_SLOTS = generateTimeSlots();

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  date: z.string().min(1, '日付を入力してください'),
  startTime: z.string().min(1, '開始時間を入力してください'),
  endTime: z.string().min(1, '終了時間を入力してください'),
  reservedBy: z.string().optional(),
  description: z.string().optional(),
  color: z.enum(['indigo','blue','cyan','teal','green','yellow','orange','red','pink','purple']).optional(),
}).refine((d) => d.startTime < d.endTime, {
  message: '終了時間は開始時間より後にしてください',
  path: ['endTime'],
});

type FormValues = z.infer<typeof schema>;

interface Props {
  facilityId: string;
  facilityColor?: FacilityColor;
  reservation?: FacilityReservation;
  defaultDate?: string;
  defaultStart?: string;
  defaultEnd?: string;
  onSave: (data: Omit<FacilityReservation, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export default function ReservationModal({
  facilityId,
  facilityColor = 'indigo',
  reservation,
  defaultDate,
  defaultStart,
  defaultEnd,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservation
      ? {
          title: reservation.title,
          date: reservation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          reservedBy: reservation.reservedBy ?? '',
          description: reservation.description ?? '',
          color: reservation.color ?? facilityColor,
        }
      : {
          date: defaultDate ?? new Date().toISOString().split('T')[0],
          startTime: defaultStart ?? '09:00',
          endTime: defaultEnd ?? '09:30',
          color: facilityColor,
        },
  });

  const selectedColor = watch('color') ?? facilityColor;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function onSubmit(values: FormValues) {
    onSave({
      facilityId,
      title: values.title,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      reservedBy: values.reservedBy || undefined,
      description: values.description || undefined,
      color: values.color,
    });
  }

  const colorDotClass = COLOR_OPTIONS.find((c) => c.value === selectedColor)?.bg ?? 'bg-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
        {/* Header with color accent */}
        <div className={cn('h-1.5 rounded-t-2xl', colorDotClass)} />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {reservation ? '予約を編集' : '予約を作成'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              {...register('title')}
              className="w-full px-3 py-3 border-b-2 border-gray-200 focus:border-indigo-500 text-lg font-medium text-gray-900 focus:outline-none transition-colors bg-transparent"
              placeholder="タイトルを追加"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Date + times */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-2.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <input
                type="date"
                {...register('date')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
              <div className="flex gap-2 items-center">
                <select
                  {...register('startTime')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span className="text-gray-400 text-sm">〜</span>
                <select
                  {...register('endTime')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime.message}</p>}
            </div>
          </div>

          {/* Reserved by */}
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              {...register('reservedBy')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="予約者名"
            />
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <AlignLeft className="w-5 h-5 text-gray-400 mt-2 shrink-0" />
            <textarea
              {...register('description')}
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="メモを追加"
            />
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-3">
            <div className={cn('w-5 h-5 rounded-full shrink-0', colorDotClass)} />
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('color', c.value)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    c.bg,
                    selectedColor === c.value && 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {reservation && onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(reservation.id); onClose(); }}
                className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            )}
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
              {reservation ? '保存する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
