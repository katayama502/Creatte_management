'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Student, StudentStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTeacherStore } from '@/store/teacherStore'
import StudentDetailModal from './StudentDetailModal'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Eye, UserCheck } from 'lucide-react'

const STATUS_BADGE: Record<
  StudentStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  trial_pending: {
    label: '体験待ち',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  trial_completed: {
    label: '体験済み',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  enrolled: {
    label: '入会手続き中',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  active: {
    label: '受講中',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  inactive: {
    label: '休会・退会',
    bg: 'bg-red-100',
    text: 'text-red-600',
    dot: 'bg-red-400',
  },
}

function formatDisplayDate(label: string, dateStr: string) {
  try {
    return `${label}: ${format(parseISO(dateStr), 'M/d(E)', { locale: ja })}`
  } catch {
    return `${label}: ${dateStr}`
  }
}

export default function StudentCard({
  student,
  isOverlay = false,
}: {
  student: Student
  isOverlay?: boolean
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { teachers } = useTeacherStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: student.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const teacher = teachers.find((t) => t.id === student.teacherId)
  const badge = STATUS_BADGE[student.status]

  // Initials avatar from student name
  const initials = student.name.slice(0, 2)

  // Date to display
  const displayDate = student.enrollmentDate
    ? formatDisplayDate('入会', student.enrollmentDate)
    : student.trialDate
    ? formatDisplayDate('体験', student.trialDate)
    : null

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 select-none',
          'transition-all duration-150',
          'cursor-grab active:cursor-grabbing',
          isDragging && !isOverlay && 'opacity-40 border-dashed ring-2 ring-indigo-200',
          isOverlay && 'shadow-xl ring-2 ring-indigo-300 rotate-1 scale-105',
          !isDragging && !isOverlay && 'hover:shadow-md hover:border-gray-200'
        )}
      >
        {/* Top row: avatar + name + status dot */}
        <div className="flex items-start gap-2.5 mb-2.5">
          {/* Initials avatar */}
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn('w-2 h-2 rounded-full shrink-0', badge.dot)} />
              <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {student.name}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{student.nameKana}</p>
          </div>
        </div>

        {/* Status badge + frequency */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              badge.bg,
              badge.text
            )}
          >
            {badge.label}
          </span>
          {(student.status === 'active' || student.status === 'enrolled') &&
            student.courseFrequency && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                月{student.courseFrequency}回
              </span>
            )}
        </div>

        {/* Teacher with color dot avatar */}
        {teacher && (
          <div className="flex items-center gap-1.5 mb-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[9px] font-bold"
              style={{ backgroundColor: teacher.color }}
            >
              {teacher.name.slice(0, 1)}
            </div>
            <span className="text-xs text-gray-500 truncate">{teacher.name}</span>
          </div>
        )}

        {/* Date row */}
        {displayDate && (
          <p className="text-xs text-gray-400 mb-2">{displayDate}</p>
        )}

        {/* Actions - always visible at bottom, slightly subtle when not hovered */}
        <div
          className={cn(
            'flex items-center gap-1.5 pt-2 border-t border-gray-50 transition-opacity duration-150',
            hovered || isOverlay ? 'opacity-100' : 'opacity-60'
          )}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsDetailOpen(true)}
            className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 py-1.5 rounded-lg transition-colors font-medium"
          >
            <Eye className="w-3 h-3" />
            詳細
          </button>
          {student.status === 'trial_completed' && (
            <button className="flex-1 flex items-center justify-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 py-1.5 rounded-lg transition-colors font-medium">
              <UserCheck className="w-3 h-3" />
              申し込み
            </button>
          )}
        </div>
      </div>

      {isDetailOpen && (
        <StudentDetailModal student={student} onClose={() => setIsDetailOpen(false)} />
      )}
    </>
  )
}
