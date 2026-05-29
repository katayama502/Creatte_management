'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { Student, CourseFrequency } from '@/types'
import { cn, formatDateJa, getDayNameJa, todayIso } from '@/lib/utils'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const schema = z.object({
  guardianName: z.string().min(1, '保護者氏名を入力してください'),
  guardianPhone: z.string().min(1, '保護者電話番号を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  emergencyContact: z.string().min(1, '緊急連絡先氏名を入力してください'),
  emergencyPhone: z.string().min(1, '緊急連絡先電話番号を入力してください'),
  courseFrequency: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]) as z.ZodType<CourseFrequency>,
  preferredDays: z.array(z.number()).min(1, '希望曜日を1つ以上選択してください'),
  preferredTime: z.string().min(1, '希望時間帯を選択してください'),
  startDate: z.string().min(1, '受講開始希望日を入力してください'),
  teacherId: z.string().optional(),
  medicalNotes: z.string().optional(),
  otherNotes: z.string().optional(),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: '利用規約への同意が必要です' }),
  }),
})

type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Course options
// ---------------------------------------------------------------------------

const COURSE_OPTIONS: {
  freq: CourseFrequency
  price: string
  label: string
  desc: string
}[] = [
  { freq: 1, price: '¥8,000', label: '月1回', desc: '月に1回、じっくり学ぶ' },
  { freq: 2, price: '¥15,000', label: '月2回', desc: '週2週おきに継続レッスン' },
  { freq: 3, price: '¥21,000', label: '月3回', desc: 'しっかり上達を目指す' },
  { freq: 4, price: '¥27,000', label: '月4回', desc: '毎週レッスンで集中習得' },
]

const TIME_OPTIONS = [
  { value: '午前', label: '午前（9〜12時）' },
  { value: '午後', label: '午後（13〜16時）' },
  { value: '夕方', label: '夕方（16〜20時）' },
  { value: '指定なし', label: '指定なし' },
]

// day indices 1=月 2=火 3=水 4=木 5=金 6=土 0=日
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  student: Student
  onSuccess?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EnrollmentForm({ student, onSuccess }: Props) {
  const { updateStudent } = useStudentStore()
  const { teachers } = useTeacherStore()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guardianName: student.guardianName ?? '',
      guardianPhone: student.guardianPhone ?? '',
      address: student.address ?? '',
      emergencyContact: '',
      emergencyPhone: '',
      courseFrequency: student.courseFrequency ?? 2,
      preferredDays: student.preferredDays ?? [],
      preferredTime: student.preferredTime ?? '',
      startDate: '',
      teacherId: student.teacherId ?? '',
      medicalNotes: '',
      otherNotes: student.notes ?? '',
      agreedToTerms: undefined as unknown as true,
    },
  })

  const selectedFreq = watch('courseFrequency')
  const selectedDays = watch('preferredDays')

  function toggleDay(day: number) {
    const current = selectedDays ?? []
    if (current.includes(day)) {
      setValue('preferredDays', current.filter((d) => d !== day), { shouldValidate: true })
    } else {
      setValue('preferredDays', [...current, day], { shouldValidate: true })
    }
  }

  async function onSubmit(data: FormValues) {
    updateStudent(student.id, {
      status: 'enrolled',
      courseFrequency: data.courseFrequency,
      teacherId: data.teacherId || undefined,
      enrollmentDate: todayIso(),
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      address: data.address,
      preferredDays: data.preferredDays,
      preferredTime: data.preferredTime,
    })
    setSubmitted(true)
    onSuccess?.()
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">申し込みが完了しました</h2>
        <p className="text-sm text-gray-500">入会手続きを受け付けました。ご連絡をお待ちください。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 print:shadow-none print:border-0">
      {/* ------------------------------------------------------------------ */}
      {/* Print-only header */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <div className="text-lg font-bold text-gray-900">クリエットプログラミング教室</div>
        <div className="text-base font-semibold text-gray-800 mt-1">入会申込書</div>
        <div className="text-sm text-gray-500 mt-0.5">
          申込日: {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: 生徒情報の確認 */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="1. 生徒情報の確認" subtitle="登録済みの情報です">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadonlyField label="お名前" value={student.name} />
          <ReadonlyField label="フリガナ" value={student.nameKana} />
          <ReadonlyField
            label="生年月日"
            value={student.birthDate ? formatDateJa(student.birthDate) : '—'}
          />
          <ReadonlyField label="電話番号" value={student.phone} />
          <ReadonlyField label="メールアドレス" value={student.email} className="sm:col-span-2" />
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: 保護者・緊急連絡先 */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="2. 保護者・緊急連絡先">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="保護者氏名" error={errors.guardianName?.message} required>
            <input
              {...register('guardianName')}
              type="text"
              placeholder="山田 太郎"
              className={inputClass(!!errors.guardianName)}
            />
          </FormField>

          <FormField label="保護者電話番号" error={errors.guardianPhone?.message} required>
            <input
              {...register('guardianPhone')}
              type="tel"
              placeholder="090-0000-0000"
              className={inputClass(!!errors.guardianPhone)}
            />
          </FormField>

          <FormField label="住所" error={errors.address?.message} required className="sm:col-span-2">
            <textarea
              {...register('address')}
              rows={2}
              placeholder="東京都渋谷区1-2-3 ○○マンション101"
              className={inputClass(!!errors.address)}
            />
          </FormField>

          <FormField label="緊急連絡先氏名" error={errors.emergencyContact?.message} required>
            <input
              {...register('emergencyContact')}
              type="text"
              placeholder="山田 花子"
              className={inputClass(!!errors.emergencyContact)}
            />
          </FormField>

          <FormField label="緊急連絡先電話番号" error={errors.emergencyPhone?.message} required>
            <input
              {...register('emergencyPhone')}
              type="tel"
              placeholder="080-0000-0000"
              className={inputClass(!!errors.emergencyPhone)}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: コース選択 */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="3. コース選択" subtitle="ご希望のレッスン頻度をお選びください">
        <Controller
          name="courseFrequency"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3">
              {COURSE_OPTIONS.map((opt) => {
                const isSelected = field.value === opt.freq
                return (
                  <button
                    key={opt.freq}
                    type="button"
                    onClick={() => field.onChange(opt.freq)}
                    className={cn(
                      'relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    <div className="text-3xl font-bold text-indigo-600 mb-1">{opt.label}</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {opt.price}
                      <span className="text-sm font-normal text-gray-500"> / 月</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>
                  </button>
                )
              })}
            </div>
          )}
        />
        {errors.courseFrequency && (
          <p className="mt-2 text-sm text-red-600">{errors.courseFrequency.message as string}</p>
        )}
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: 希望スケジュール */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="4. 希望スケジュール">
        <div className="space-y-5">
          {/* 希望曜日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              希望曜日
              <span className="ml-1 text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-gray-400">（複数選択可）</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAYS.map((day) => {
                const isActive = (selectedDays ?? []).includes(day)
                const isSat = day === 6
                const isSun = day === 0
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-all border-2',
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : isSat
                        ? 'border-blue-200 text-blue-600 hover:bg-blue-50'
                        : isSun
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {getDayNameJa(day)}
                  </button>
                )
              })}
            </div>
            {errors.preferredDays && (
              <p className="mt-1.5 text-sm text-red-600">{errors.preferredDays.message as string}</p>
            )}
          </div>

          {/* 希望時間帯 */}
          <FormField label="希望時間帯" error={errors.preferredTime?.message} required>
            <select {...register('preferredTime')} className={inputClass(!!errors.preferredTime)}>
              <option value="">選択してください</option>
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* 受講開始希望日 */}
          <FormField label="受講開始希望日" error={errors.startDate?.message} required>
            <input
              {...register('startDate')}
              type="date"
              min={todayIso()}
              className={inputClass(!!errors.startDate)}
            />
          </FormField>

          {/* 担当講師 */}
          <FormField label="担当講師">
            <select {...register('teacherId')} className={inputClass(false)}>
              <option value="">未定 / スクールにお任せ</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（{t.subjects.join('・')}）
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Section 5: 特記事項 */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="5. 特記事項">
        <div className="space-y-4">
          <FormField label="アレルギー・健康上の注意事項">
            <textarea
              {...register('medicalNotes')}
              rows={3}
              placeholder="特になし"
              className={inputClass(false)}
            />
          </FormField>
          <FormField label="その他備考">
            <textarea
              {...register('otherNotes')}
              rows={3}
              placeholder="ご要望・ご質問など"
              className={inputClass(false)}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Section 6: 利用規約 */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard title="6. 利用規約への同意">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-36 overflow-y-auto text-sm text-gray-600 leading-relaxed mb-4">
          <p className="font-semibold text-gray-800 mb-2">クリエットプログラミング教室 利用規約（抜粋）</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>月謝は毎月25日までにお振込みください。</li>
            <li>
              欠席の場合、24時間前までにご連絡ください。振替レッスンは月1回まで対応します。
            </li>
            <li>退会は1ヶ月前にお申し出ください。</li>
            <li>個人情報は本スクールの運営目的のみに使用します。</li>
          </ol>
        </div>

        <Controller
          name="agreedToTerms"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={field.value === true}
                onChange={(e) =>
                  field.onChange(e.target.checked ? true : (undefined as unknown as true))
                }
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span
                className={cn(
                  'text-sm',
                  field.value ? 'text-gray-900 font-medium' : 'text-gray-700'
                )}
              >
                上記利用規約に同意します
                <span className="ml-1 text-red-500">*</span>
              </span>
            </label>
          )}
        />
        {errors.agreedToTerms && (
          <p className="mt-2 text-sm text-red-600">{errors.agreedToTerms.message as string}</p>
        )}
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* Footer buttons */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm text-base"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              送信中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              申し込みを完了する
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="sm:w-40 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-base"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷する
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:break-inside-avoid">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function ReadonlyField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
        {value || '—'}
      </dd>
    </div>
  )
}

function FormField({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors',
    hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
  )
}
