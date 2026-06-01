'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  nameKana: z.string().min(1, 'フリガナを入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください').or(z.literal('')).optional(),
  phone: z.string().min(1, '電話番号を入力してください'),
  birthDate: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  trialDate: z.string().optional(),
  trialTeacherId: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors placeholder:text-gray-300'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const errorClass = 'text-xs text-red-500 mt-1'

export default function TrialRegistrationModal({ onClose }: { onClose: () => void }) {
  const { addStudent } = useStudentStore()
  const { teachers } = useTeacherStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    addStudent({
      name: data.name,
      nameKana: data.nameKana,
      email: data.email || '',
      phone: data.phone,
      birthDate: data.birthDate,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      trialDate: data.trialDate,
      trialTeacherId: data.trialTeacherId,
      notes: data.notes,
      status: 'trial_pending',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">体験会登録</h2>
            <p className="text-xs text-gray-400 mt-0.5">新しい体験生徒を登録します</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className={labelClass}>
                お名前 <span className="text-red-400">*</span>
              </label>
              <input {...register('name')} placeholder="山田 花子" className={inputClass} />
              {errors.name && <p className={errorClass}>{errors.name.message}</p>}
            </div>

            {/* NameKana */}
            <div>
              <label className={labelClass}>
                フリガナ <span className="text-red-400">*</span>
              </label>
              <input {...register('nameKana')} placeholder="ヤマダ ハナコ" className={inputClass} />
              {errors.nameKana && <p className={errorClass}>{errors.nameKana.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>メールアドレス</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>
                電話番号 <span className="text-red-400">*</span>
              </label>
              <input {...register('phone')} placeholder="090-1234-5678" className={inputClass} />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            {/* BirthDate */}
            <div>
              <label className={labelClass}>生年月日</label>
              <input {...register('birthDate')} type="date" className={inputClass} />
            </div>

            {/* Trial Date */}
            <div>
              <label className={labelClass}>体験希望日</label>
              <input {...register('trialDate')} type="date" className={inputClass} />
            </div>

            {/* Guardian Name */}
            <div>
              <label className={labelClass}>保護者氏名</label>
              <input {...register('guardianName')} placeholder="山田 太郎" className={inputClass} />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className={labelClass}>保護者電話番号</label>
              <input
                {...register('guardianPhone')}
                placeholder="090-0000-0000"
                className={inputClass}
              />
            </div>

            {/* Teacher */}
            <div className="col-span-2">
              <label className={labelClass}>担当講師（体験）</label>
              <select {...register('trialTeacherId')} className={inputClass}>
                <option value="">未定</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={labelClass}>備考</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="その他、特記事項があればご記入ください"
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm disabled:opacity-60"
          >
            体験会を登録する
          </button>
        </div>
      </div>
    </div>
  )
}
