'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building, Users } from 'lucide-react';
import { Facility, FacilityColor } from '@/types';
import { cn } from '@/lib/utils';

const COLOR_OPTIONS: { value: FacilityColor; bg: string; ring: string }[] = [
  { value: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { value: 'blue',   bg: 'bg-blue-500',   ring: 'ring-blue-500' },
  { value: 'cyan',   bg: 'bg-cyan-500',   ring: 'ring-cyan-500' },
  { value: 'teal',   bg: 'bg-teal-500',   ring: 'ring-teal-500' },
  { value: 'green',  bg: 'bg-green-500',  ring: 'ring-green-500' },
  { value: 'yellow', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
  { value: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
  { value: 'red',    bg: 'bg-red-500',    ring: 'ring-red-500' },
  { value: 'pink',   bg: 'bg-pink-500',   ring: 'ring-pink-500' },
  { value: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
];

const schema = z.object({
  name: z.string().min(1, '施設名を入力してください'),
  description: z.string().optional(),
  capacity: z.coerce.number().optional(),
  color: z.enum(['indigo','blue','cyan','teal','green','yellow','orange','red','pink','purple']),
  floor: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  facility?: Facility;
  onSave: (data: Omit<Facility, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function FacilityModal({ facility, onSave, onClose }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: facility
      ? {
          name: facility.name,
          description: facility.description ?? '',
          capacity: facility.capacity,
          color: facility.color,
          floor: facility.floor ?? '',
          notes: facility.notes ?? '',
          active: facility.active,
        }
      : { color: 'indigo', active: true },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function onSubmit(values: FormValues) {
    onSave({
      name: values.name,
      description: values.description || undefined,
      capacity: values.capacity,
      color: values.color,
      floor: values.floor || undefined,
      notes: values.notes || undefined,
      active: values.active,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            {facility ? '施設を編集' : '施設を追加'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              施設名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="第1教室"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-3.5 h-3.5 inline mr-1" />定員
              </label>
              <input
                type="number"
                {...register('capacity')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="10"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">フロア</label>
              <input
                {...register('floor')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="2F"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カラー</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('color', c.value)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    c.bg,
                    selectedColor === c.value && `ring-2 ring-offset-2 ${c.ring} scale-110`
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <input
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="PC 10台、プロジェクター完備"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="特記事項など"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('active')} className="w-4 h-4 rounded text-indigo-600" />
            <label className="text-sm text-gray-700">使用可能</label>
          </div>

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
              {facility ? '保存する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
