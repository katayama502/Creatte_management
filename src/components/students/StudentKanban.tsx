'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useStudentStore } from '@/store/studentStore'
import { Student, StudentStatus } from '@/types'
import StudentCard from './StudentCard'
import { cn } from '@/lib/utils'

const COLUMNS: {
  status: StudentStatus
  label: string
  bgColor: string
  headerColor: string
  borderColor: string
}[] = [
  {
    status: 'trial_pending',
    label: '体験待ち',
    bgColor: 'bg-gray-50',
    headerColor: 'bg-gray-200 text-gray-700',
    borderColor: 'border-gray-200',
  },
  {
    status: 'trial_completed',
    label: '体験済み',
    bgColor: 'bg-amber-50',
    headerColor: 'bg-amber-200 text-amber-800',
    borderColor: 'border-amber-200',
  },
  {
    status: 'enrolled',
    label: '入会手続き中',
    bgColor: 'bg-blue-50',
    headerColor: 'bg-blue-200 text-blue-800',
    borderColor: 'border-blue-200',
  },
  {
    status: 'active',
    label: '受講中',
    bgColor: 'bg-green-50',
    headerColor: 'bg-green-200 text-green-800',
    borderColor: 'border-green-200',
  },
  {
    status: 'inactive',
    label: '休会・退会',
    bgColor: 'bg-red-50',
    headerColor: 'bg-red-200 text-red-700',
    borderColor: 'border-red-200',
  },
]

function DroppableColumn({
  status,
  label,
  bgColor,
  headerColor,
  borderColor,
  students,
  isDraggingOver,
}: {
  status: StudentStatus
  label: string
  bgColor: string
  headerColor: string
  borderColor: string
  students: Student[]
  isDraggingOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border-2 transition-all duration-200 min-w-[240px] w-[240px] sm:min-w-[260px] sm:w-[260px] max-h-[calc(100vh-155px)] md:max-h-[calc(100vh-180px)]',
        bgColor,
        borderColor,
        isDraggingOver && 'border-indigo-400 shadow-lg scale-[1.01]'
      )}
    >
      {/* Column Header */}
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-xl', headerColor)}>
        <span className="font-semibold text-sm">{label}</span>
        <span className="bg-white bg-opacity-70 text-xs font-bold px-2 py-0.5 rounded-full">
          {students.length}
        </span>
      </div>

      {/* Cards Drop Zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-2 transition-colors duration-200',
          isDraggingOver && 'bg-indigo-50 bg-opacity-50'
        )}
      >
        <SortableContext
          items={students.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </SortableContext>
        {students.length === 0 && (
          <div className="flex items-center justify-center h-24 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            ここにドロップ
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentKanban() {
  const { students, moveStudentStatus } = useStudentStore()
  const [activeStudent, setActiveStudent] = useState<Student | null>(null)
  const [overColumn, setOverColumn] = useState<StudentStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const getStudentsByStatus = (status: StudentStatus) =>
    students.filter((s) => s.status === status)

  const handleDragStart = (event: DragStartEvent) => {
    const student = students.find((s) => s.id === event.active.id)
    setActiveStudent(student || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setOverColumn(null)
      return
    }
    const overId = over.id as string
    const isColumn = COLUMNS.some((c) => c.status === overId)
    if (isColumn) {
      setOverColumn(overId as StudentStatus)
    } else {
      const overStudent = students.find((s) => s.id === overId)
      if (overStudent) setOverColumn(overStudent.status)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveStudent(null)
    setOverColumn(null)

    if (!over) return

    const studentId = active.id as string
    const overId = over.id as string

    const isColumn = COLUMNS.some((c) => c.status === overId)
    let targetStatus: StudentStatus

    if (isColumn) {
      targetStatus = overId as StudentStatus
    } else {
      const overStudent = students.find((s) => s.id === overId)
      if (!overStudent) return
      targetStatus = overStudent.status
    }

    const draggedStudent = students.find((s) => s.id === studentId)
    if (!draggedStudent || draggedStudent.status === targetStatus) return

    moveStudentStatus(studentId, targetStatus)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 md:gap-4 p-3 md:p-6 overflow-x-auto h-full">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            {...col}
            students={getStudentsByStatus(col.status)}
            isDraggingOver={overColumn === col.status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeStudent ? (
          <div className="opacity-90 rotate-2 scale-105">
            <StudentCard student={activeStudent} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
