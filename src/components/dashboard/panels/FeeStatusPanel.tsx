'use client'

import { useFeeStore, PaymentStatus } from '@/store/feeStore'
import { useStudentStore } from '@/store/studentStore'
import { CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" />
        延滞
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        未払い
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle2 className="w-3 h-3" />
      支払済
    </span>
  )
}

export default function FeeStatusPanel() {
  const { getMonthlyFees, markAsPaid } = useFeeStore()
  const { students } = useStudentStore()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const fees = getMonthlyFees(year, month)

  const paidCount = fees.filter((f) => f.status === 'paid').length
  const pendingCount = fees.filter((f) => f.status === 'pending').length
  const overdueCount = fees.filter((f) => f.status === 'overdue').length
  const total = fees.length

  const progressPct = total > 0 ? Math.round((paidCount / total) * 100) : 0
  const totalRevenue = fees.filter((f) => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0)

  const unpaidFees = fees.filter((f) => f.status !== 'paid')

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-indigo-500" />
        <span className="text-sm font-semibold text-gray-700">
          {year}年{month}月
        </span>
      </div>

      {/* Summary row */}
      <div className="flex gap-3 text-sm">
        <span className="text-green-600 font-medium">支払済 {paidCount}件</span>
        <span className="text-gray-300">|</span>
        <span className="text-amber-600 font-medium">未払い {pendingCount}件</span>
        <span className="text-gray-300">|</span>
        <span className="text-red-600 font-medium">延滞 {overdueCount}件</span>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>支払完了率</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Unpaid list */}
      {unpaidFees.length > 0 ? (
        <div className="space-y-2">
          {unpaidFees.map((fee) => {
            const student = students.find((s) => s.id === fee.studentId)
            if (!student) return null
            return (
              <div
                key={fee.id}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                  fee.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StatusBadge status={fee.status} />
                  <span className="font-medium text-gray-800 truncate">{student.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-600">
                    ¥{fee.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => markAsPaid(fee.studentId, year, month)}
                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                  >
                    支払済にする
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">全員の支払いが完了しています</p>
      )}

      {/* Total revenue */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">今月の月謝合計</span>
        <span className="text-sm font-bold text-gray-900">
          ¥{totalRevenue.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
