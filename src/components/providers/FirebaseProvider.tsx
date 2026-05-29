'use client'

import { useEffect, useRef } from 'react'
import { useStudentStore } from '@/store/studentStore'
import { useTeacherStore } from '@/store/teacherStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFeeStore } from '@/store/feeStore'

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const setStudents = useStudentStore((s) => s.setStudents)
  const setTeachers = useTeacherStore((s) => s.setTeachers)
  const setLessons = useScheduleStore((s) => s.setLessons)
  const setFees = useFeeStore((s) => s.setFees)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const unsubs: (() => void)[] = []

    // Lazy-import to avoid SSR issues
    Promise.all([
      import('@/lib/firestore/students'),
      import('@/lib/firestore/teachers'),
      import('@/lib/firestore/lessons'),
      import('@/lib/firestore/fees'),
    ]).then(([{ subscribeStudents }, { subscribeTeachers }, { subscribeLessons }, { subscribeFees }]) => {
      unsubs.push(subscribeStudents(setStudents))
      unsubs.push(subscribeTeachers(setTeachers))
      unsubs.push(subscribeLessons(setLessons))
      unsubs.push(subscribeFees(setFees))
    })

    return () => unsubs.forEach((u) => u())
  }, [setStudents, setTeachers, setLessons, setFees])

  return <>{children}</>
}
