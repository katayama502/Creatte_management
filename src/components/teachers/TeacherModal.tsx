'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTeacherStore } from '@/store/teacherStore'
import { Teacher } from '@/types'
import { cn, getDayNameJa } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  name: z.string().min(1, 'お名前を入力してください'),
  nameKana: z.string().min(1, 'フリガナを入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください').or(z.literal('')),
  phone: z.string().min(1, '電話番号を入力してください'),
  subjects: z.array(z.string()).min(1, '担当科目を1つ以上選択してください'),
  availableDays: z.array(z.number()).min(1, '対応可能曜日を1つ以上選択してください'),
  color: z.string().min(1, 'カラーを選択してください'),
  maxStudents: z
    .number({ invalid_type_error: '人数を入力してください' })
    .min(1, '1以上で入力してください')
    .max(30, '30以下で入力してください'),
})

type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_SUBJECTS = ['Scratch', 'Canva', 'Mbot']
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]
const PRESET_COLORS = [
  '#6366f1', // indigo
  '#f97316', // orange
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#0ea5e9', // sky
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  teacher?: Teacher
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TeacherModal({ teacher, onClose }: Props) {
  const { addTeacher, updateTeacher, deleteTeacher } = useTeacherStore()
  const isEdit = !!teacher
  const overlayRef = useRef<HTMLDivElement>(null)

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
      name: teacher?.name ?? '',
      nameKana: teacher?.nameKana ?? '',
      email: teacher?.email ?? '',
      phone: teacher?.phone ?? '',
      subjects: teacher?.subjects ?? [],
      availableDays: teacher?.availableDays ?? [],
      color: teacher?.color ?? PRESET_COLORS[0],
      maxStudents: teacher?.maxStudents ?? 15,
    },
  })

  const selectedSubjects = watch('subjects')
  const selectedDays = watch('availableDays')
  const selectedColor = watch('color')

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function toggleSubject(subject: string) {
    const current = selectedSubjects ?? []
    if (current.includes(subject)) {
      setValue('subjects', current.filter((s) => s !== subject), { shouldValidate: true })
    } else {
      setValue('subjects', [...current, subject], { shouldValidate: true })
    }
  }

  function toggleDay(day: number) {
    const current = selectedDays ?? []
    if (current.includes(day)) {
      setValue('availableDays', current.filter((d) => d !== day), { shouldValidate: true })
    } else {
      setValue('availableDays', [...current, day], { shouldValidate: true })
    }
  }

  function onSubmit(data: FormValues) {
    if (isEdit && teacher) {
      updateTeacher(teacher.id, data)
    } else {
      addTeacher(data)
    }
    onClose()
  }

  function handleDelete() {
    if (teacher && confirm(`${teacher.name} を削除しますか？`)) {
      deleteTeacher(teacher.id)
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div
          className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0"
          style={{ borderTopColor: selectedColor, borderTopWidth: 4 }}
        >
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '講師を編集' : '講師を追加'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body (scrollable) */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="お名前" error={errors.name?.message} required>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="中村 由紀"
                  className={inputClass(!!errors.name)}
                />
              </FormField>
              <FormField label="フリガナ" error={errors.nameKana?.message} required>
                <input
                  {...register('nameKana')}
                  type="text"
                  placeholder="ナカムラ ユキ"
                  className={inputClass(!!errors.nameKana)}
                />
              </FormField>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="メールアドレス" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="teacher@kurietto.example.com"
                  className={inputClass(!!errors.email)}
                />
              </FormField>
              <FormField label="電話番号" error={errors.phone?.message} required>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="03-0000-0000"
                  className={inputClass(!!errors.phone)}
                />
              </FormField>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                担当科目
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_SUBJECTS.map((subject) => {
                  const isActive = (selectedSubjects ?? []).includes(subject)
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                        isActive
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {subject}
                    </button>
                  )
                })}
              </div>
              {errors.subjects && (
                <p className="mt-1.5 text-sm text-red-600">{errors.subjects.message as string}</p>
              )}
            </div>

            {/* Available days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応可能曜日
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="flex gap-2">
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
                        'w-10 h-10 rounded-full text-sm font-medium transition-all border-2 flex-shrink-0',
                        isActive
                          ? 'text-white border-transparent shadow-sm'
                          : isSat
                          ? 'border-blue-200 text-blue-500 hover:bg-blue-50'
                          : isSun
                          ? 'border-red-200 text-red-500 hover:bg-red-50'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      )}
                      style={isActive ? { backgroundColor: selectedColor, borderColor: selectedColor } : undefined}
                    >
                      {getDayNameJa(day)}
                    </button>
                  )
                })}
              </div>
              {errors.availableDays && (
                <p className="mt-1.5 text-sm text-red-600">{errors.availableDays.message as string}</p>
              )}
            </div>

            {/* Color */}
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カラー
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={cn(
                          'w-9 h-9 rounded-full transition-all ring-offset-2',
                          field.value === color ? 'ring-2 scale-110' : 'hover:scale-105'
                        )}
                        style={{
                          backgroundColor: color,
                          outline: field.value === color ? `2px solid ${color}` : 'none',
                          outlineOffset: '2px',
                        }}
                        title={color}
                      >
                        {field.value === color && (
                          <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />

            {/* Max students */}
            <FormField label="最大担当生徒数" error={errors.maxStudents?.message} required>
              <div className="flex items-center gap-3">
                <input
                  {...register('maxStudents', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={30}
                  className={cn(inputClass(!!errors.maxStudents), 'w-28')}
                />
                <span className="text-sm text-gray-500">名まで</span>
              </div>
            </FormField>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0 bg-gray-50/50">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                削除
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 text-sm font-medium rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {isEdit ? '更新する' : '追加する'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

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
