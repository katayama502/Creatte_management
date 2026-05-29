'use client'

import { useScheduleStore } from '@/store/scheduleStore'
import { AttendanceStatus } from '@/types'
import { cn } from '@/lib/utils'

interface AttendanceStatsProps {
  studentId: string
}

const DOT_COLORS: Record<AttendanceStatus, string> = {
  attended: 'bg-green-500',
  absent:   'bg-red-500',
  late:     'bg-amber-500',
  makeup:   'bg-blue-500',
}

const DOT_LABELS: Record<AttendanceStatus, string> = {
  attended: '出席',
  absent:   '欠席',
  late:     '遅刻',
  makeup:   '振替',
}

export default function AttendanceStats({ studentId }: AttendanceStatsProps) {
  const getAttendanceByStudent = useScheduleStore((s) => s.getAttendanceByStudent)
  const getLessonsByStudent = useScheduleStore((s) => s.getLessonsByStudent)

  const stats = getAttendanceByStudent(studentId)
  const allLessons = getLessonsByStudent(studentId)

  // Last 6 lessons that have an attendanceStatus, sorted by date desc
  const recentLessons = allLessons
    .filter((l) => l.attendanceStatus !== undefined)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 6)
    .reverse() // show oldest → newest left to right

  const rateColor =
    stats.rate >= 80
      ? { ring: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-50' }
      : stats.rate >= 60
      ? { ring: 'stroke-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' }
      : { ring: 'stroke-red-500', text: 'text-red-600', bg: 'bg-red-50' }

  // SVG circle ring
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (stats.rate / 100) * circumference

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">出席記録</p>

      {stats.total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">出席記録がまだありません</p>
      ) : (
        <>
          {/* Rate ring + breakdown */}
          <div className="flex items-center gap-5">
            {/* SVG ring */}
            <div className="relative flex-shrink-0">
              <svg width="72" height="72" className="-rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className={cn('transition-all duration-500', rateColor.ring)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-lg font-bold leading-none', rateColor.text)}>
                  {stats.rate}%
                </span>
                <span className="text-xs text-gray-400 leading-none mt-0.5">出席率</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 flex-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">出席</span>
                <span className="text-xs font-bold text-gray-800 ml-auto">{stats.attended}回</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">欠席</span>
                <span className="text-xs font-bold text-gray-800 ml-auto">{stats.absent}回</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">遅刻</span>
                <span className="text-xs font-bold text-gray-800 ml-auto">{stats.late}回</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="text-xs text-gray-600">振替</span>
                <span className="text-xs font-bold text-gray-800 ml-auto">{stats.makeup}回</span>
              </div>
            </div>
          </div>

          {/* Recent 6 lessons dots */}
          {recentLessons.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">直近{recentLessons.length}回</p>
              <div className="flex items-center gap-2">
                {recentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    title={`${lesson.date} ${DOT_LABELS[lesson.attendanceStatus!]}`}
                    className={cn(
                      'w-5 h-5 rounded-full flex-shrink-0',
                      DOT_COLORS[lesson.attendanceStatus!]
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
