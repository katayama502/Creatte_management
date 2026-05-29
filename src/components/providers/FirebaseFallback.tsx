'use client'

import { useEffect } from 'react'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFeeStore } from '@/store/feeStore'

// Check if Firebase is configured
const isFirebaseConfigured = () =>
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

export function useFallbackData() {
  const students = useStudentStore((s) => s.students)
  const setStudents = useStudentStore((s) => s.setStudents)
  const teachers = useTeacherStore((s) => s.teachers)
  const setTeachers = useTeacherStore((s) => s.setTeachers)
  const lessons = useScheduleStore((s) => s.lessons)
  const setLessons = useScheduleStore((s) => s.setLessons)
  const fees = useFeeStore((s) => s.fees)
  const setFees = useFeeStore((s) => s.setFees)

  useEffect(() => {
    if (isFirebaseConfigured()) return
    if (students.length > 0 || teachers.length > 0) return

    import('@/store/sampleData').then(
      ({ SAMPLE_STUDENTS, SAMPLE_TEACHERS, SAMPLE_LESSONS, SAMPLE_FEES }) => {
        setStudents(SAMPLE_STUDENTS)
        setTeachers(SAMPLE_TEACHERS)
        if (lessons.length === 0) setLessons(SAMPLE_LESSONS)
        if (fees.length === 0) setFees(SAMPLE_FEES)
      }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
