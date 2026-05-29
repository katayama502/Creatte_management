'use client'

import { useState } from 'react'
import { useTeacherStore } from '@/store/teacherStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFeeStore } from '@/store/feeStore'
import { Teacher } from '@/types'
import TeacherCard from '@/components/teachers/TeacherCard'
import TeacherModal from '@/components/teachers/TeacherModal'
import TeacherScheduleCard from '@/components/teachers/TeacherScheduleCard'

export default function TeachersPage() {
  const { teachers } = useTeacherStore()
  const { getLessonsByTeacher } = useScheduleStore()
  const { getMonthlyFees } = useFeeStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>(undefined)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const monthlyFees = getMonthlyFees(year, month)
  const totalRevenue = monthlyFees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0)

  function handleAdd() {
    setEditingTeacher(undefined)
    setModalOpen(true)
  }

  function handleEdit(teacher: Teacher) {
    setEditingTeacher(teacher)
    setModalOpen(true)
  }

  function handleClose() {
    setModalOpen(false)
    setEditingTeacher(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">講師管理</h1>
            <p className="mt-1 text-sm text-gray-500">
              {teachers.length}名の講師が登録されています
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            講師を追加
          </button>
        </div>

        {/* Monthly revenue summary */}
        <div className="mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {year}年{month}月 今月の月謝合計
          </span>
          <span className="text-lg font-bold text-indigo-700">
            ¥{totalRevenue.toLocaleString()}
          </span>
        </div>

        {/* Grid */}
        {teachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="text-4xl mb-3">👩‍🎓</div>
            <p className="text-gray-500 text-sm">講師がまだ登録されていません</p>
            <button
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              最初の講師を追加する
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {teachers.map((teacher) => {
              const monthLessonCount = getLessonsByTeacher(teacher.id, year, month).length
              return (
                <div key={teacher.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <TeacherCard
                      teacher={teacher}
                      onEdit={() => handleEdit(teacher)}
                    />
                    {monthLessonCount > 0 && (
                      <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        今月{monthLessonCount}件
                      </div>
                    )}
                  </div>
                  <TeacherScheduleCard teacher={teacher} year={year} month={month} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <TeacherModal teacher={editingTeacher} onClose={handleClose} />
      )}
    </div>
  )
}
