'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { Student, StudentStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, UserCheck } from 'lucide-react'
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
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-red-100 text-red-600',
}

const STATUS_DOT: Record<StudentStatus, string> = {
  trial_pending: 'bg-gray-400',
  trial_completed: 'bg-amber-500',
  enrolled: 'bg-blue-500',
  active: 'bg-emerald-500',
  inactive: 'bg-red-400',
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
    <div className="p-3 md:p-6 h-full overflow-auto">
      {/* Status Filter */}
      <div className="flex items-center gap-1.5 md:gap-2 mb-4 flex-wrap">
        <span className="text-xs md:text-sm text-gray-500 font-medium">絞り込み:</span>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
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
            className="px-2.5 py-1 rounded-full text-xs text-gray-400 hover:text-gray-600 underline"
          >
            クリア
          </button>
        )}
      </div>

      {/* ── Mobile card list (< md) ───────────────────────────── */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">生徒が見つかりません</div>
        )}
        {sorted.map((student) => {
          const teacher = teachers.find((t) => t.id === student.teacherId)
          const date = student.enrollmentDate || student.trialDate
          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
                    {student.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                    <p className="text-xs text-gray-400 truncate">{student.nameKana}</p>
                  </div>
                </div>
                {/* Status badge */}
                <span className={cn('shrink-0 px-2 py-0.5 rounded-full text-xs font-medium', STATUS_BADGE[student.status])}>
                  {STATUS_LABELS[student.status]}
                </span>
              </div>

              {/* Details row */}
              <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-500">
                {student.courseFrequency && (
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                    月{student.courseFrequency}回
                  </span>
                )}
                {teacher && (
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: teacher.color }}
                    />
                    {teacher.name}
                  </span>
                )}
                {date && <span>{date}</span>}
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  詳細を見る
                </button>
                {student.status === 'trial_completed' && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-medium transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                    申し込み
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Desktop table (≥ md) ──────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT[student.status])} />
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
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
                          className="w-2 h-2 rounded-full shrink-0"
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
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />詳細
                      </button>
                      {student.status === 'trial_completed' && (
                        <button className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors">
                          <UserCheck className="w-3 h-3" />申し込み
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
