'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, BookOpen, FileText } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import AttendanceToggle from './AttendanceToggle'
import { cn } from '@/lib/utils'

interface LessonMemoModalProps {
  lessonId: string
  onClose: () => void
}

interface FormValues {
  lessonContent: string
  homeworkNote: string
  notes: string
}

const QUICK_CHIPS = ['Scratch基礎', 'Scratchゲーム', 'Canvaデザイン', 'Canvaスライド', 'Mbot操作', 'Mbotプログラム', 'アルゴリズム', 'デバッグ']

export default function LessonMemoModal({ lessonId, onClose }: LessonMemoModalProps) {
  const lessons = useScheduleStore((s) => s.lessons)
  const updateLesson = useScheduleStore((s) => s.updateLesson)
  const updateLessonContent = useScheduleStore((s) => s.updateLessonContent)
  const students = useStudentStore((s) => s.students)
  const teachers = useTeacherStore((s) => s.teachers)

  const lesson = lessons.find((l) => l.id === lessonId)
  const student = students.find((s) => s.id === lesson?.studentId)
  const teacher = teachers.find((t) => t.id === lesson?.teacherId)

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      lessonContent: lesson?.lessonContent ?? '',
      homeworkNote: lesson?.homeworkNote ?? '',
      notes: lesson?.notes ?? '',
    },
  })

  const lessonContentValue = watch('lessonContent')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!lesson) return null

  const onSubmit = (data: FormValues) => {
    updateLessonContent(lessonId, data.lessonContent, data.homeworkNote)
    updateLesson(lessonId, { notes: data.notes })
    onClose()
  }

  const appendChip = (chip: string) => {
    const current = lessonContentValue
    const separator = current && !current.endsWith('　') && !current.endsWith(' ') ? '　' : ''
    setValue('lessonContent', current + separator + chip)
  }

  const formattedDate = lesson.date
    ? new Date(lesson.date + 'T00:00:00').toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {student?.name ?? '—'} のレッスンメモ
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {formattedDate}　{lesson.startTime}〜{lesson.endTime}　担当: {teacher?.name ?? '—'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-5">
            {/* Attendance */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                出席状況
              </label>
              <AttendanceToggle
                lessonId={lessonId}
                current={lesson.attendanceStatus}
                compact={false}
              />
            </div>

            {/* Lesson Content */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                レッスン内容
              </label>
              {/* Quick-fill chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendChip(chip)}
                    className="px-2.5 py-1 text-xs rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <textarea
                {...register('lessonContent')}
                rows={3}
                placeholder="本日のレッスン内容を記録..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
              />
            </div>

            {/* Homework */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                宿題・次回までの課題
              </label>
              <textarea
                {...register('homeworkNote')}
                rows={2}
                placeholder="次回までの練習課題..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
              />
            </div>

            {/* General Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                全体メモ
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder="その他メモ..."
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
