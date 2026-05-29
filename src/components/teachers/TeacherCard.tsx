'use client'

import { Teacher } from '@/types'
import { useStudentStore } from '@/store/studentStore'
import { cn, getDayNameJa } from '@/lib/utils'

interface Props {
  teacher: Teacher
  onEdit: () => void
}

// day order: 月火水木金土日
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]

export default function TeacherCard({ teacher, onEdit }: Props) {
  const { students } = useStudentStore()

  const assignedCount = students.filter(
    (s) =>
      s.teacherId === teacher.id &&
      (s.status === 'active' || s.status === 'enrolled')
  ).length

  const loadPercent = Math.min(
    Math.round((assignedCount / teacher.maxStudents) * 100),
    100
  )

  const loadColor =
    loadPercent >= 90
      ? 'bg-red-500'
      : loadPercent >= 70
      ? 'bg-orange-400'
      : 'bg-indigo-500'

  // Initials from name (first kanji of family name + first kanji of given name)
  const nameParts = teacher.name.replace(/\s+/g, '')
  const initials = nameParts.slice(0, 2)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: teacher.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
            style={{
              backgroundColor: teacher.color + '33', // ~20% opacity hex
              color: teacher.color,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-base leading-tight">
              {teacher.name}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{teacher.nameKana}</div>
          </div>
        </div>

        {/* Subjects */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {teacher.subjects.map((subject) => (
            <span
              key={subject}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: teacher.color + '20',
                color: teacher.color,
              }}
            >
              {subject}
            </span>
          ))}
        </div>

        {/* Available days */}
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-1.5">対応可能曜日</div>
          <div className="flex gap-1">
            {WEEKDAYS.map((day) => {
              const isAvailable = teacher.availableDays.includes(day)
              const isSat = day === 6
              const isSun = day === 0
              return (
                <div
                  key={day}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                    isAvailable
                      ? isSat
                        ? 'bg-blue-100 text-blue-700'
                        : isSun
                        ? 'bg-red-100 text-red-700'
                        : 'text-white'
                      : 'bg-gray-100 text-gray-300'
                  )}
                  style={
                    isAvailable && !isSat && !isSun
                      ? { backgroundColor: teacher.color, color: '#fff' }
                      : undefined
                  }
                >
                  {getDayNameJa(day)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Student count + progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">担当生徒</span>
            <span className="text-xs font-semibold text-gray-700">
              {assignedCount}
              <span className="text-gray-400 font-normal"> / {teacher.maxStudents}名</span>
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', loadColor)}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
          {loadPercent >= 90 && (
            <p className="text-xs text-red-500 mt-1">定員まで残りわずかです</p>
          )}
        </div>

        {/* Edit button */}
        <div className="mt-auto">
          <button
            onClick={onEdit}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border-2 border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            編集する
          </button>
        </div>
      </div>
    </div>
  )
}
