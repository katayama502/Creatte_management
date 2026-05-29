'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStudentStore } from '@/store/studentStore'
import EnrollmentForm from '@/components/enrollment/EnrollmentForm'

export default function EnrollmentFormPage() {
  const params = useParams()
  const router = useRouter()
  const { students } = useStudentStore()

  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const student = students.find((s) => s.id === id)

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            生徒が見つかりません
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            指定された生徒IDは存在しないか、削除された可能性があります。
          </p>
          <Link
            href="/enrollment"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/enrollment"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            入会申し込み管理に戻る
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-700 font-bold">{student.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">入会申し込みフォーム</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.name}（{student.nameKana}）
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <EnrollmentForm
          student={student}
          onSuccess={() => router.push('/enrollment')}
        />
      </div>
    </div>
  )
}
