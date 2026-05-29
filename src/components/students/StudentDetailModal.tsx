'use client'

import { useState } from 'react'
import { Student, StudentStatus, CourseFrequency, AttendanceStatus } from '@/types'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFeeStore } from '@/store/feeStore'
import { cn } from '@/lib/utils'
import { X, Trash2, ArrowRightLeft, BookOpen, ChevronRight, CheckCircle2, AlertCircle, CreditCard, CalendarDays } from 'lucide-react'
import LessonHistoryPanel from './LessonHistoryPanel'
import AttendanceStats from './AttendanceStats'

const STATUS_LABELS: Record<StudentStatus, string> = {
  trial_pending: '体験待ち',
  trial_completed: '体験済み',
  enrolled: '入会手続き中',
  active: '受講中',
  inactive: '休会・退会',
}

const STATUS_FLOW: StudentStatus[] = [
  'trial_pending',
  'trial_completed',
  'enrolled',
  'active',
  'inactive',
]

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  attended: '出席',
  absent: '欠席',
  late: '遅刻',
  makeup: '振替',
}

const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  attended: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  makeup: 'bg-blue-100 text-blue-700',
}

type TabType = '基本情報' | 'レッスン履歴' | '出席記録' | '月謝'

export default function StudentDetailModal({
  student,
  onClose,
}: {
  student: Student
  onClose: () => void
}) {
  const { updateStudent, deleteStudent, moveStudentStatus } = useStudentStore()
  const { teachers } = useTeacherStore()
  const { getFeeByStudent, markAsPaid } = useFeeStore()
  const getLessonsByStudent = useScheduleStore((s) => s.getLessonsByStudent)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newStatus, setNewStatus] = useState<StudentStatus>(student.status)
  const [newFrequency, setNewFrequency] = useState<CourseFrequency | undefined>(
    student.courseFrequency
  )
  const [activeTab, setActiveTab] = useState<TabType>('基本情報')

  const teacher = teachers.find((t) => t.id === student.teacherId)

  const handleApplyChanges = () => {
    if (newStatus !== student.status) {
      moveStudentStatus(student.id, newStatus)
    }
    if (newFrequency !== student.courseFrequency) {
      updateStudent(student.id, { courseFrequency: newFrequency })
    }
    onClose()
  }

  const handleDelete = () => {
    deleteStudent(student.id)
    onClose()
  }

  const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    ) : null

  const currentIdx = STATUS_FLOW.indexOf(student.status)

  // Attendance tab: last 10 lessons with attendance status
  const recentAttendanceLessons = getLessonsByStudent(student.id)
    .filter((l) => l.attendanceStatus !== undefined)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 10)

  const TABS: TabType[] = ['基本情報', 'レッスン履歴', '出席記録', '月謝']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-600">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{student.name}</h2>
              <p className="text-xs text-gray-400">{student.nameKana}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* ------------------------------------------------------------------ */}
          {/* Tab: 基本情報 */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === '基本情報' && (
            <>
              {/* Status Timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  ステータス
                </p>
                <div className="flex items-center">
                  {STATUS_FLOW.map((s, i) => {
                    const isPast = i <= currentIdx
                    const isCurrent = s === student.status
                    return (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full border-2 transition-all',
                              isCurrent
                                ? 'border-indigo-500 bg-indigo-500 scale-125'
                                : isPast
                                ? 'border-indigo-300 bg-indigo-200'
                                : 'border-gray-200 bg-white'
                            )}
                          />
                          <p
                            className={cn(
                              'text-xs mt-1 text-center leading-tight whitespace-nowrap',
                              isCurrent
                                ? 'text-indigo-600 font-semibold'
                                : isPast
                                ? 'text-gray-500'
                                : 'text-gray-300'
                            )}
                          >
                            {STATUS_LABELS[s]}
                          </p>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div
                            className={cn(
                              'h-0.5 flex-1 mx-1 mb-5',
                              i < currentIdx ? 'bg-indigo-300' : 'bg-gray-200'
                            )}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="メールアドレス" value={student.email} />
                <InfoRow label="電話番号" value={student.phone} />
                <InfoRow label="生年月日" value={student.birthDate} />
                <InfoRow label="担当講師" value={teacher?.name} />
                <InfoRow label="保護者氏名" value={student.guardianName} />
                <InfoRow label="保護者電話番号" value={student.guardianPhone} />
                <InfoRow label="住所" value={student.address} />
                <InfoRow label="受講回数/月" value={student.courseFrequency ? `月${student.courseFrequency}回` : undefined} />
                <InfoRow label="体験日" value={student.trialDate} />
                <InfoRow label="入会日" value={student.enrollmentDate} />
                {student.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">備考</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{student.notes}</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  クイックアクション
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {/* Status Change */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1.5">ステータス変更</p>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as StudentStatus)}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Frequency Change */}
                  {(student.status === 'enrolled' || student.status === 'active') && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <BookOpen className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700 mb-1.5">受講回数/月</p>
                        <div className="flex gap-2">
                          {([1, 2, 3, 4] as CourseFrequency[]).map((n) => (
                            <button
                              key={n}
                              onClick={() => setNewFrequency(n)}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all',
                                newFrequency === n
                                  ? 'bg-indigo-500 text-white border-indigo-500'
                                  : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                              )}
                            >
                              月{n}回
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Apply */}
                  <button
                    onClick={handleApplyChanges}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    変更を適用する
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Tab: レッスン履歴 */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === 'レッスン履歴' && (
            <LessonHistoryPanel studentId={student.id} />
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Tab: 出席記録 */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === '出席記録' && (
            <div className="space-y-4">
              {/* Summary stats card */}
              <AttendanceStats studentId={student.id} />

              {/* Recent lessons list */}
              {recentAttendanceLessons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    直近10回のレッスン
                  </p>
                  <div className="space-y-2">
                    {recentAttendanceLessons.map((lesson) => {
                      const lessonTeacher = teachers.find((t) => t.id === lesson.teacherId)
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">
                              {new Date(lesson.date + 'T00:00:00').toLocaleDateString('ja-JP', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {lesson.startTime}〜{lesson.endTime}　{lessonTeacher?.name ?? '—'}
                            </p>
                          </div>
                          {lesson.attendanceStatus && (
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                                ATTENDANCE_COLORS[lesson.attendanceStatus]
                              )}
                            >
                              {ATTENDANCE_LABELS[lesson.attendanceStatus]}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recentAttendanceLessons.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">
                  出席記録がありません
                </p>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Tab: 月謝 */}
          {/* ------------------------------------------------------------------ */}
          {activeTab === '月謝' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">月謝情報</p>
              <p className="text-sm text-gray-400 text-center py-8">月謝情報はここに表示されます</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          {confirmDelete ? (
            <div className="flex items-center gap-3 w-full">
              <p className="text-sm text-red-600 flex-1">本当に削除しますか？</p>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                削除する
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
              {student.status === 'trial_completed' && (
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4" />
                  申し込みフォームへ
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
