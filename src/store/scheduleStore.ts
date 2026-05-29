import { create } from "zustand";
import { Lesson, AttendanceStatus } from "@/types";

interface ScheduleState {
  lessons: Lesson[];
  setLessons: (lessons: Lesson[]) => void;
  addLesson: (lesson: Omit<Lesson, "id">) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  markAttendance: (lessonId: string, status: AttendanceStatus) => void;
  updateLessonContent: (lessonId: string, content: string, homework?: string) => void;
  getLessonsByMonth: (year: number, month: number) => Lesson[];
  getLessonsByTeacher: (
    teacherId: string,
    year: number,
    month: number
  ) => Lesson[];
  getLessonsByStudent: (studentId: string) => Lesson[];
  getAttendanceByStudent: (studentId: string) => { total: number; attended: number; absent: number; late: number; makeup: number; rate: number };
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  lessons: [],

  setLessons: (lessons) => set({ lessons }),

  addLesson: (lesson) => {
    const newLesson: Lesson = {
      ...lesson,
      id: 'temp-' + Date.now(),
    };
    set((state) => ({ lessons: [...state.lessons, newLesson] }));
    import('@/lib/firestore/lessons').then(({ createLesson }) => {
      createLesson(lesson).then((created) => {
        set((state) => ({
          lessons: state.lessons.map((l) => l.id === newLesson.id ? created : l),
        }));
      });
    });
  },

  updateLesson: (id, updates) => {
    set((state) => ({
      lessons: state.lessons.map((l) => l.id === id ? { ...l, ...updates } : l),
    }));
    import('@/lib/firestore/lessons').then(({ updateLesson }) => updateLesson(id, updates));
  },

  deleteLesson: (id) => {
    set((state) => ({ lessons: state.lessons.filter((l) => l.id !== id) }));
    import('@/lib/firestore/lessons').then(({ deleteLesson }) => deleteLesson(id));
  },

  markAttendance: (lessonId, status) => {
    set((state) => ({
      lessons: state.lessons.map((l) =>
        l.id === lessonId ? { ...l, attendanceStatus: status } : l
      ),
    }));
    import('@/lib/firestore/lessons').then(({ updateLesson }) =>
      updateLesson(lessonId, { attendanceStatus: status })
    );
  },

  updateLessonContent: (lessonId, content, homework) => {
    set((state) => ({
      lessons: state.lessons.map((l) =>
        l.id === lessonId
          ? { ...l, lessonContent: content, ...(homework !== undefined ? { homeworkNote: homework } : {}) }
          : l
      ),
    }));
    import('@/lib/firestore/lessons').then(({ updateLesson }) =>
      updateLesson(lessonId, {
        lessonContent: content,
        ...(homework !== undefined ? { homeworkNote: homework } : {}),
      })
    );
  },

  getLessonsByMonth: (year, month) => {
    const { lessons } = get();
    return lessons.filter((l) => {
      const d = new Date(l.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  },

  getLessonsByTeacher: (teacherId, year, month) => {
    const { lessons } = get();
    return lessons.filter((l) => {
      const d = new Date(l.date);
      return (
        l.teacherId === teacherId &&
        d.getFullYear() === year &&
        d.getMonth() + 1 === month
      );
    });
  },

  getLessonsByStudent: (studentId) => {
    const { lessons } = get();
    return lessons.filter((l) => l.studentId === studentId);
  },

  getAttendanceByStudent: (studentId) => {
    const { lessons } = get();
    const studentLessons = lessons.filter(
      (l) => l.studentId === studentId && l.attendanceStatus !== undefined
    );
    const total = studentLessons.length;
    const attended = studentLessons.filter((l) => l.attendanceStatus === 'attended').length;
    const absent = studentLessons.filter((l) => l.attendanceStatus === 'absent').length;
    const late = studentLessons.filter((l) => l.attendanceStatus === 'late').length;
    const makeup = studentLessons.filter((l) => l.attendanceStatus === 'makeup').length;
    const rate = total > 0 ? Math.round(((attended + late + makeup) / total) * 100) : 0;
    return { total, attended, absent, late, makeup, rate };
  },
}));
