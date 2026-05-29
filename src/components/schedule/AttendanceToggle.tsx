'use client'

import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { AttendanceStatus } from '@/types'
import { cn } from '@/lib/utils'

interface AttendanceToggleProps {
  lessonId: string
  current?: AttendanceStatus
  compact?: boolean
}

interface StatusOption {
  value: AttendanceStatus
  label: string
  icon: React.ReactNode
  activeClass: string
  inactiveClass: string
  dotClass: string
  tooltip: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'attended',
    label: '出席',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    activeClass: 'bg-green-500 text-white border-green-500',
    inactiveClass: 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600',
    dotClass: 'bg-green-500',
    tooltip: '出席',
  },
  {
    value: 'absent',
    label: '欠席',
    icon: <XCircle className="w-3.5 h-3.5" />,
    activeClass: 'bg-red-500 text-white border-red-500',
    inactiveClass: 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600',
    dotClass: 'bg-red-500',
    tooltip: '欠席',
  },
  {
    value: 'late',
    label: '遅刻',
    icon: <Clock className="w-3.5 h-3.5" />,
    activeClass: 'bg-amber-500 text-white border-amber-500',
    inactiveClass: 'border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600',
    dotClass: 'bg-amber-500',
    tooltip: '遅刻',
  },
  {
    value: 'makeup',
    label: '振替',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    activeClass: 'bg-blue-500 text-white border-blue-500',
    inactiveClass: 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600',
    dotClass: 'bg-blue-500',
    tooltip: '振替',
  },
]

export default function AttendanceToggle({ lessonId, current, compact = false }: AttendanceToggleProps) {
  const markAttendance = useScheduleStore((s) => s.markAttendance)

  const handleClick = (status: AttendanceStatus) => {
    // Toggle off if already selected
    if (current === status) {
      // We can't "unset" directly, but we can leave as-is or allow re-toggling
      // For now, clicking same status does nothing
      return
    }
    markAttendance(lessonId, status)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => { e.stopPropagation(); handleClick(opt.value) }}
            title={opt.tooltip}
            className={cn(
              'w-3 h-3 rounded-full transition-all border-2',
              current === opt.value
                ? `${opt.dotClass} border-transparent`
                : 'bg-white border-gray-300 hover:border-gray-400'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={(e) => { e.stopPropagation(); handleClick(opt.value) }}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
            current === opt.value ? opt.activeClass : opt.inactiveClass
          )}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
