'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { Student, StudentStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import StudentDetailModal from './StudentDetailModal'

const STATUS_LABELS: Record<StudentStatus, string> = {
  trial_pending: '体験待ち',
  trial_completed: '体験済み',
  enrolled: '入会手続き中',
  active: '受講中',
  inactive: '休会・退会',
}

const STATUS_BADGE: Record<StudentStatus, string> = {
  trial_pending: 'bg-gray-100 text-gray-600',
  trial_completed: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
}

type SortKey = 'name' | 'status' | 'courseFrequency' | 'createdAt'
type SortDir = 'asc' | 'desc'

export default function StudentList() {
  const { students } = useStudentStore()
  const { teachers } = useTeacherStore()
  const [selectedStatuses, setSelectedStatuses] = useState<StudentStatus[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const allStatuses = Object.keys(STATUS_LABELS) as StudentStatus[]

  const toggleStatus = (status: StudentStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = students.filter(
    (s) => selectedStatuses.length === 0 || selectedStatuses.includes(s.status)
  )

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = ''
    let bVal: string | number = ''
    if (sortKey === 'name') { aVal = a.name; bVal = b.name }
    else if (sortKey === 'status') { aVal = a.status; bVal = b.status }
    else if (sortKey === 'courseFrequency') { aVal = a.courseFrequency ?? 0; bVal = b.courseFrequency ?? 0 }
    else if (sortKey === 'createdAt') { aVal = a.createdAt; bVal = b.createdAt }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : (
      <ChevronsUpDown className="w-3 h-3 text-gray-300" />
    )

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">絞り込み:</span>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              selectedStatuses.includes(status)
                ? cn('border-transparent', STATUS_BADGE[status])
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            )}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
        {selectedStatuses.length > 0 && (
          <button
            onClick={() => setSelectedStatuses([])}
            className="px-3 py-1 rounded-full text-xs text-gray-400 hover:text-gray-600 underline"
          >
            クリア
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">名前 <SortIcon col="name" /></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">フリガナ</th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">ステータス <SortIcon col="status" /></div>
              </th>
              <th
                className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort('courseFrequency')}
              >
                <div className="flex items-center gap-1">受講回数/月 <SortIcon col="courseFrequency" /></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">担当講師</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">体験日 / 入会日</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  生徒が見つかりません
                </td>
              </tr>
            )}
            {sorted.map((student) => {
              const teacher = teachers.find((t) => t.id === student.teacherId)
              const date = student.enrollmentDate || student.trialDate
              return (
                <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-gray-500">{student.nameKana}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', STATUS_BADGE[student.status])}>
                      {STATUS_LABELS[student.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.courseFrequency ? `月${student.courseFrequency}回` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {teacher ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: teacher.color }}
                        />
                        <span className="text-gray-600">{teacher.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{date || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        詳細
                      </button>
                      {student.status === 'trial_completed' && (
                        <button className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
                          申し込み
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  )
}
