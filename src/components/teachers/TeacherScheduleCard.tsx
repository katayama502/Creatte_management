'use client'

import { Teacher, Lesson } from '@/types'
import { useScheduleStore } from '@/store/scheduleStore'
import { useStudentStore } from '@/store/studentStore'
import { cn } from '@/lib/utils'

interface Props {
  teacher: Teacher
  year: number
  month: number
}

export default function TeacherScheduleCard({ teacher, year, month }: Props) {
  const { getLessonsByTeacher } = useScheduleStore()
  const { students } = useStudentStore()

  const lessons: Lesson[] = getLessonsByTeacher(teacher.id, year, month)

  // Unique student IDs in lessons this month
  const uniqueStudentIds = Array.from(new Set(lessons.map((l) => l.studentId)))
  const uniqueStudents = uniqueStudentIds
    .map((id) => students.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)

  const displayedStudents = uniqueStudents.slice(0, 5)
  const extraCount = uniqueStudents.length - displayedStudents.length

  const completedCount = lessons.filter((l) => l.status === 'completed').length
  const scheduledCount = lessons.filter((l) => l.status === 'scheduled').length
  const cancelledCount = lessons.filter((l) => l.status === 'cancelled').length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: teacher.color }} />

      <div className="p-4">
        {/* Teacher name + period */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: teacher.color }}
          />
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {teacher.name}
            </div>
            <div className="text-xs text-gray-400">
              {year}年{month}月
            </div>
          </div>
        </div>

        {/* Lesson count summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatPill label="予定" value={scheduledCount} color="bg-indigo-50 text-indigo-700" />
          <StatPill label="完了" value={completedCount} color="bg-green-50 text-green-700" />
          <StatPill label="欠席" value={cancelledCount} color="bg-gray-100 text-gray-500" />
        </div>

        {/* Total lessons */}
        <div className="text-xs text-gray-500 mb-3">
          合計{' '}
          <span className="font-semibold text-gray-800">{lessons.length}</span> 件のレッスン
        </div>

        {/* Student list */}
        {uniqueStudents.length === 0 ? (
          <div className="text-xs text-gray-400 italic">この月のレッスンはありません</div>
        ) : (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1.5">担当生徒</div>
            <div className="flex flex-wrap gap-1.5">
              {displayedStudents.map((student) => (
                <span
                  key={student.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: teacher.color + '18',
                    color: teacher.color,
                  }}
                >
                  {student.name}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  他{extraCount}名
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className={cn('rounded-lg px-2 py-1.5 text-center', color)}>
      <div className="text-lg font-bold leading-tight">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}
