'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, User, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Sponsor, SponsorStatus } from '@/types';

const schema = z.object({
  companyName: z.string().min(1, '企業名を入力してください'),
  contactName: z.string().min(1, '担当者名を入力してください'),
  contactEmail: z.string().email('有効なメールアドレスを入力').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  industry: z.string().optional(),
  amount: z.coerce.number().min(0, '0以上の金額を入力してください'),
  startDate: z.string().min(1, '開始日を入力してください'),
  endDate: z.string().optional(),
  status: z.enum(['active', 'pending', 'inactive']),
  fliersPlaced: z.boolean().optional(),
  cardsDistributed: z.coerce.number().optional(),
  nextContactDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const STATUS_OPTIONS: { value: SponsorStatus; label: string; color: string }[] = [
  { value: 'active', label: '協賛中', color: 'text-green-700 bg-green-50 border-green-200' },
  { value: 'pending', label: '検討中', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'inactive', label: '終了', color: 'text-gray-600 bg-gray-50 border-gray-200' },
];

interface SponsorModalProps {
  sponsor?: Sponsor;
  defaultStatus?: SponsorStatus;
  onSave: (data: Omit<Sponsor, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function SponsorModal({ sponsor, defaultStatus = 'pending', onSave, onClose }: SponsorModalProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: sponsor
      ? {
          companyName: sponsor.companyName,
          contactName: sponsor.contactName,
          contactEmail: sponsor.contactEmail ?? '',
          contactPhone: sponsor.contactPhone ?? '',
          industry: sponsor.industry ?? '',
          amount: sponsor.amount,
          startDate: sponsor.startDate,
          endDate: sponsor.endDate ?? '',
          status: sponsor.status,
          fliersPlaced: sponsor.fliersPlaced ?? false,
          cardsDistributed: sponsor.cardsDistributed ?? 0,
          nextContactDate: sponsor.nextContactDate ?? '',
          notes: sponsor.notes ?? '',
        }
      : {
          status: defaultStatus,
          amount: 0,
          startDate: new Date().toISOString().split('T')[0],
          fliersPlaced: false,
          cardsDistributed: 0,
        },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  function onSubmit(values: FormValues) {
    onSave({
      companyName: values.companyName,
      contactName: values.contactName,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
      industry: values.industry || undefined,
      amount: values.amount,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      status: values.status,
      fliersPlaced: values.fliersPlaced,
      cardsDistributed: values.cardsDistributed || 0,
      nextContactDate: values.nextContactDate || undefined,
      notes: values.notes || undefined,
    });
  }

  const currentStatus = watch('status');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            {sponsor ? '協賛企業を編集' : '協賛企業を追加'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Company name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-3.5 h-3.5 inline mr-1" />企業名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('companyName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="株式会社〇〇"
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
          </div>

          {/* Contact name / industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1" />担当者名 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('contactName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="山田 太郎"
              />
              {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
              <input
                {...register('industry')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="IT・飲食・小売 等"
              />
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1" />電話番号
              </label>
              <input
                {...register('contactPhone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="090-0000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-3.5 h-3.5 inline mr-1" />メール
              </label>
              <input
                {...register('contactEmail')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="info@example.com"
              />
              {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
            </div>
          </div>

          {/* Amount / Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-3.5 h-3.5 inline mr-1" />協賛金額（年額）
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                <input
                  type="number"
                  {...register('amount')}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="10000"
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input type="radio" {...register('status')} value={opt.value} className="sr-only" />
                    <span className={`block text-center text-xs font-medium px-1 py-1.5 rounded-lg border transition-all ${
                      currentStatus === opt.value ? opt.color + ' ring-1 ring-current' : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Fliers / Cards / Next contact */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('fliersPlaced')}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <label className="text-sm text-gray-700">チラシ設置済</label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">紹介カード配布数</label>
              <input
                type="number"
                {...register('cardsDistributed')}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">次回コンタクト予定</label>
              <input
                type="date"
                {...register('nextContactDate')}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="特記事項など"
            />
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
              {sponsor ? '保存する' : '追加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
