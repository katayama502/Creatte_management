'use client'

import { useScheduleStore } from '@/store/scheduleStore'
import { useTeacherStore } from '@/store/teacherStore'
import { cn } from '@/lib/utils'

interface Props {
  studentId: string
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: 'キャンセル',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const ATTENDANCE_COLORS: Record<string, string> = {
  attended: 'bg-green-500',
  absent: 'bg-red-500',
  late: 'bg-amber-500',
  makeup: 'bg-purple-500',
}

const ATTENDANCE_LABELS: Record<string, string> = {
  attended: '出席',
  absent: '欠席',
  late: '遅刻',
  makeup: '振替',
}

export default function LessonHistoryPanel({ studentId }: Props) {
  const { getLessonsByStudent } = useScheduleStore()
  const { teachers } = useTeacherStore()

  const allLessons = getLessonsByStudent(studentId)

  // Sort by date desc
  const sortedLessons = [...allLessons].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const recentLessons = sortedLessons.slice(0, 12)

  // Attendance summary
  const lessonsWithAttendance = allLessons.filter((l) => l.attendanceStatus != null)
  const attendedCount = lessonsWithAttendance.filter((l) => l.attendanceStatus === 'attended').length
  const attendanceRate =
    lessonsWithAttendance.length > 0
      ? Math.round((attendedCount / lessonsWithAttendance.length) * 100)
      : null

  if (allLessons.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        レッスン履歴はありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">総レッスン数: </span>
          <span className="font-semibold text-gray-800">{allLessons.length}回</span>
        </div>
        {attendanceRate !== null && (
          <div>
            <span className="text-gray-500">出席率: </span>
            <span className="font-semibold text-gray-800">{attendanceRate}%</span>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div className="space-y-2">
        {recentLessons.map((lesson) => {
          const teacher = teachers.find((t) => t.id === lesson.teacherId)
          return (
            <div
              key={lesson.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
            >
              {/* Teacher color dot */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: teacher?.color ?? '#94a3b8' }}
                title={teacher?.name}
              />

              {/* Date */}
              <span className="text-gray-500 w-24 flex-shrink-0">
                {lesson.date.replace(/-/g, '/').slice(2)}
              </span>

              {/* Teacher name */}
              <span className="text-gray-700 flex-1 truncate">
                {teacher?.name ?? '—'}
              </span>

              {/* Time */}
              <span className="text-gray-500 text-xs flex-shrink-0">
                {lesson.startTime}〜{lesson.endTime}
              </span>

              {/* Status badge */}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0',
                  STATUS_COLORS[lesson.status] ?? 'bg-gray-100 text-gray-500'
                )}
              >
                {STATUS_LABELS[lesson.status] ?? lesson.status}
              </span>

              {/* Attendance dot */}
              {lesson.attendanceStatus && (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    ATTENDANCE_COLORS[lesson.attendanceStatus] ?? 'bg-gray-300'
                  )}
                  title={ATTENDANCE_LABELS[lesson.attendanceStatus] ?? lesson.attendanceStatus}
                />
              )}
            </div>
          )
        })}
      </div>

      {allLessons.length > 12 && (
        <p className="text-xs text-gray-400 text-center">
          直近12件を表示中（全{allLessons.length}件）
        </p>
      )}
    </div>
  )
}
