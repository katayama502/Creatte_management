'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/studentStore'
import { StudentStatus } from '@/types'
import StudentKanban from '@/components/students/StudentKanban'
import StudentList from '@/components/students/StudentList'
import TrialRegistrationModal from '@/components/students/TrialRegistrationModal'
import { LayoutGrid, List, Plus } from 'lucide-react'

const STATUS_LABELS: Record<StudentStatus, string> = {
  trial_pending: '体験待ち',
  trial_completed: '体験済み',
  enrolled: '入会手続き中',
  active: '受講中',
  inactive: '休会・退会',
}

const STATUS_COLORS: Record<StudentStatus, string> = {
  trial_pending: 'bg-gray-100 text-gray-700',
  trial_completed: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-600',
}

export default function StudentsPage() {
  const { students } = useStudentStore()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false)

  const statusCounts = (Object.keys(STATUS_LABELS) as StudentStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: students.filter((s) => s.status === status).length,
    color: STATUS_COLORS[status],
  }))

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">生徒管理</h1>
            <p className="text-sm text-gray-500 mt-0.5">全 {students.length} 名</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                カンバン
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                リスト
              </button>
            </div>
            {/* New Trial Button */}
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              体験会登録
            </button>
          </div>
        </div>
        {/* Status Count Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusCounts.map(({ status, label, count, color }) => (
            <span
              key={status}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}
            >
              {label}
              <span className="font-bold">{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? <StudentKanban /> : <StudentList />}
      </div>

      {/* Trial Registration Modal */}
      {isTrialModalOpen && (
        <TrialRegistrationModal onClose={() => setIsTrialModalOpen(false)} />
      )}
    </div>
  )
}
