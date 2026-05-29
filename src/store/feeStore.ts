import { create } from 'zustand'
import { CourseFrequency } from '@/types'

const FEE_TABLE: Record<CourseFrequency, number> = {
  1: 8000,
  2: 15000,
  3: 21000,
  4: 27000,
}

export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface MonthlyFee {
  id: string
  studentId: string
  year: number
  month: number
  amount: number
  status: PaymentStatus
  paidAt?: string
  note?: string
}

interface FeeStore {
  fees: MonthlyFee[]
  setFees: (fees: MonthlyFee[]) => void
  getFeeByStudent: (studentId: string, year: number, month: number) => MonthlyFee | undefined
  getMonthlyFees: (year: number, month: number) => MonthlyFee[]
  markAsPaid: (studentId: string, year: number, month: number) => void
  calculateFee: (frequency: CourseFrequency) => number
}

export const useFeeStore = create<FeeStore>((set, get) => ({
  fees: [],

  setFees: (fees) => set({ fees }),

  getFeeByStudent: (studentId, year, month) => {
    return get().fees.find(
      (f) => f.studentId === studentId && f.year === year && f.month === month
    )
  },

  getMonthlyFees: (year, month) => {
    return get().fees.filter((f) => f.year === year && f.month === month)
  },

  markAsPaid: (studentId, year, month) => {
    const paidAt = new Date().toISOString().slice(0, 10)
    const existing = get().fees.find(
      (f) => f.studentId === studentId && f.year === year && f.month === month
    )

    if (existing) {
      set((state) => ({
        fees: state.fees.map((f) =>
          f.studentId === studentId && f.year === year && f.month === month
            ? { ...f, status: 'paid' as PaymentStatus, paidAt }
            : f
        ),
      }))
      import('@/lib/firestore/fees').then(({ updateFeeStatus }) =>
        updateFeeStatus(existing.id, 'paid', paidAt)
      )
    } else {
      const newFee: MonthlyFee = {
        id: 'temp-' + Date.now(),
        studentId,
        year,
        month,
        amount: 0,
        status: 'paid' as PaymentStatus,
        paidAt,
      }
      set((state) => ({ fees: [...state.fees, newFee] }))
      import('@/lib/firestore/fees').then(({ createFee }) => {
        const { id: _id, ...feeData } = newFee
        createFee(feeData).then((created) => {
          set((state) => ({
            fees: state.fees.map((f) => f.id === newFee.id ? created : f),
          }))
        })
      })
    }
  },

  calculateFee: (frequency) => FEE_TABLE[frequency],
}))
