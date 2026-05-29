'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Student, StudentStatus } from '@/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useTeacherStore } from '@/store/teacherStore'
import StudentDetailModal from './StudentDetailModal'

const STATUS_BADGE: Record<StudentStatus, { label: string; className: string }> = {
  trial_pending: { label: '体験待ち', className: 'bg-gray-100 text-gray-600' },
  trial_completed: { label: '体験済み', className: 'bg-amber-100 text-amber-700' },
  enrolled: { label: '入会手続き中', className: 'bg-blue-100 text-blue-700' },
  active: { label: '受講中', className: 'bg-green-100 text-green-700' },
  inactive: { label: '休会・退会', className: 'bg-red-100 text-red-600' },
}

export default function StudentCard({
  student,
  isOverlay = false,
}: {
  student: Student
  isOverlay?: boolean
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { teachers } = useTeacherStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: student.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const teacher = teachers.find((t) => t.id === student.teacherId)
  const badge = STATUS_BADGE[student.status]

  const displayDate = student.enrollmentDate
    ? `入会: ${student.enrollmentDate}`
    : student.trialDate
    ? `体験: ${student.trialDate}`
    : null

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'bg-white rounded-xl border border-gray-100 shadow-sm p-3 select-none',
          'hover:shadow-md transition-all duration-150',
          'cursor-grab active:cursor-grabbing',
          isDragging && !isOverlay && 'opacity-40 border-dashed',
          isOverlay && 'shadow-xl ring-2 ring-indigo-300'
        )}
      >
        {/* Name */}
        <div className="mb-2">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{student.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{student.nameKana}</p>
        </div>

        {/* Status + Frequency */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', badge.className)}>
            {badge.label}
          </span>
          {(student.status === 'active' || student.status === 'enrolled') &&
            student.courseFrequency && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                月{student.courseFrequency}回
              </span>
            )}
        </div>

        {/* Teacher */}
        {teacher && (
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: teacher.color }}
            />
            <span className="text-xs text-gray-500 truncate">{teacher.name}</span>
          </div>
        )}

        {/* Date */}
        {displayDate && <p className="text-xs text-gray-400 mb-2">{displayDate}</p>}

        {/* Actions */}
        <div
          className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsDetailOpen(true)}
            className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 py-1.5 rounded-lg transition-colors font-medium"
          >
            詳細
          </button>
          {student.status === 'trial_completed' && (
            <button className="flex-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 py-1.5 rounded-lg transition-colors font-medium">
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
