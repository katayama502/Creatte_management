import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Course, Discount, FeeRule, SchoolSettings, CourseFrequency } from '@/types'

const DEFAULT_SCHOOL: SchoolSettings = {
  name: 'クリエットプログラミング教室',
  subtitle: 'プログラミング教室',
  address: '',
  phone: '',
  email: '',
  website: '',
  trialFee: 0,
  enrollmentFee: 5000,
  materialsFee: 3000,
  notes: '',
}

const DEFAULT_COURSES: Course[] = [
  { id: 'scratch', name: 'Scratch', description: 'ビジュアルプログラミングでゲームや作品を作ります', color: '#f97316', targetAge: '小学1年〜6年', active: true },
  { id: 'canva', name: 'Canva', description: 'デザインツールを使ったデジタル作品制作', color: '#6366f1', targetAge: '小学3年〜中学3年', active: true },
  { id: 'mbot', name: 'Mbot', description: 'ロボット制御プログラミング', color: '#10b981', targetAge: '小学4年〜中学3年', active: true },
]

const DEFAULT_FEE_RULES: FeeRule[] = [
  { frequency: 1, amount: 8000 },
  { frequency: 2, amount: 15000 },
  { frequency: 3, amount: 21000 },
  { frequency: 4, amount: 27000 },
]

const DEFAULT_DISCOUNTS: Discount[] = [
  { id: 'd1', name: '兄弟割引', type: 'fixed', value: 1000, description: '2人目以降の兄弟・姉妹が入会した場合', active: true, stackable: true },
  { id: 'd2', name: '紹介割引', type: 'fixed', value: 1000, description: '在籍生徒の紹介で入会した場合（紹介者にも適用）', active: true, stackable: true },
  { id: 'd3', name: '年間一括払い割引', type: 'percentage', value: 5, description: '12ヶ月分を一括払いした場合', active: false, stackable: false },
  { id: 'd4', name: '複数コース割引', type: 'percentage', value: 10, description: '2コース以上受講の場合', active: false, stackable: true },
]

interface SettingsStore {
  school: SchoolSettings
  courses: Course[]
  feeRules: FeeRule[]
  discounts: Discount[]

  // School
  updateSchool: (updates: Partial<SchoolSettings>) => void

  // Courses
  addCourse: (course: Omit<Course, 'id'>) => void
  updateCourse: (id: string, updates: Partial<Course>) => void
  deleteCourse: (id: string) => void
  toggleCourseActive: (id: string) => void

  // Fees
  updateFeeRule: (frequency: CourseFrequency, amount: number) => void

  // Discounts
  addDiscount: (discount: Omit<Discount, 'id'>) => void
  updateDiscount: (id: string, updates: Partial<Discount>) => void
  deleteDiscount: (id: string) => void
  toggleDiscountActive: (id: string) => void

  // Helper
  getFeeAmount: (frequency: CourseFrequency) => number
  getActiveDiscounts: () => Discount[]
  calculateDiscountedFee: (baseAmount: number, discountIds: string[]) => number
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      school: DEFAULT_SCHOOL,
      courses: DEFAULT_COURSES,
      feeRules: DEFAULT_FEE_RULES,
      discounts: DEFAULT_DISCOUNTS,

      updateSchool: (updates) =>
        set((state) => ({ school: { ...state.school, ...updates } })),

      addCourse: (course) => {
        const id = 'course-' + Date.now()
        set((state) => ({ courses: [...state.courses, { ...course, id }] }))
      },

      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => c.id === id ? { ...c, ...updates } : c),
        })),

      deleteCourse: (id) =>
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) })),

      toggleCourseActive: (id) =>
        set((state) => ({
          courses: state.courses.map((c) => c.id === id ? { ...c, active: !c.active } : c),
        })),

      updateFeeRule: (frequency, amount) =>
        set((state) => ({
          feeRules: state.feeRules.map((r) =>
            r.frequency === frequency ? { ...r, amount } : r
          ),
        })),

      addDiscount: (discount) => {
        const id = 'disc-' + Date.now()
        set((state) => ({ discounts: [...state.discounts, { ...discount, id }] }))
      },

      updateDiscount: (id, updates) =>
        set((state) => ({
          discounts: state.discounts.map((d) => d.id === id ? { ...d, ...updates } : d),
        })),

      deleteDiscount: (id) =>
        set((state) => ({ discounts: state.discounts.filter((d) => d.id !== id) })),

      toggleDiscountActive: (id) =>
        set((state) => ({
          discounts: state.discounts.map((d) => d.id === id ? { ...d, active: !d.active } : d),
        })),

      getFeeAmount: (frequency) => {
        const rule = get().feeRules.find((r) => r.frequency === frequency)
        return rule?.amount ?? 0
      },

      getActiveDiscounts: () => get().discounts.filter((d) => d.active),

      calculateDiscountedFee: (baseAmount, discountIds) => {
        const { discounts } = get()
        const selected = discounts.filter((d) => discountIds.includes(d.id) && d.active)
        // Apply percentage discounts first, then fixed
        const pct = selected.filter((d) => d.type === 'percentage')
        const fixed = selected.filter((d) => d.type === 'fixed')
        let amount = baseAmount
        for (const d of pct) {
          amount = Math.round(amount * (1 - d.value / 100))
        }
        for (const d of fixed) {
          amount = Math.max(0, amount - d.value)
        }
        return amount
      },
    }),
    {
      name: 'kurietto-settings',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  )
)
