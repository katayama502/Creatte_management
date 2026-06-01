'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStudentStore } from '@/store/studentStore'
import { Student } from '@/types'
import { cn, formatDateJa, getStatusLabel } from '@/lib/utils'

type Tab = 'pending' | 'submitted'

export default function EnrollmentPage() {
  const { students } = useStudentStore()
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  const pendingStudents = students.filter((s) => s.status === 'trial_completed')
  const submittedStudents = students.filter(
    (s) => s.status === 'enrolled' || s.status === 'active'
  )

  const displayed = activeTab === 'pending' ? pendingStudents : submittedStudents

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">入会申し込み管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            体験レッスン完了後の入会申し込み手続きを管理します
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 w-fit border border-gray-100">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            未提出
            {pendingStudents.length > 0 && (
              <span
                className={cn(
                  'ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                  activeTab === 'pending'
                    ? 'bg-white text-indigo-600'
                    : 'bg-indigo-100 text-indigo-600'
                )}
              >
                {pendingStudents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={cn(
              'px-5 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === 'submitted'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            提出済み
            {submittedStudents.length > 0 && (
              <span
                className={cn(
                  'ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                  activeTab === 'submitted'
                    ? 'bg-white text-indigo-600'
                    : 'bg-green-100 text-green-700'
                )}
              >
                {submittedStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* Student List */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">
              {activeTab === 'pending' ? '📋' : '✅'}
            </div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'pending'
                ? '未提出の申し込みはありません'
                : '提出済みの申し込みはありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((student) => (
              <StudentRow key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Student['status'] }) {
  const colorMap: Record<Student['status'], string> = {
    trial_pending: 'bg-yellow-100 text-yellow-700',
    trial_completed: 'bg-blue-100 text-blue-700',
    enrolled: 'bg-orange-100 text-orange-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorMap[status]
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}

function StudentRow({ student }: { student: Student }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-3 md:px-5 py-4 flex items-center gap-3 md:gap-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <span className="text-indigo-700 font-bold text-sm">
          {student.name.charAt(0)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-semibold text-gray-900">{student.name}</span>
          <StatusBadge status={student.status} />
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs text-gray-500 flex-wrap">
          <span>{student.nameKana}</span>
          {student.trialDate && (
            <span>体験日: {formatDateJa(student.trialDate)}</span>
          )}
          {student.enrollmentDate && (
            <span>入会日: {formatDateJa(student.enrollmentDate)}</span>
          )}
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/enrollment/${student.id}`}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 md:px-4 py-2 min-h-[44px] bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">申し込みフォームを開く</span>
        <span className="sm:hidden">開く</span>
      </Link>
    </div>
  )
}
