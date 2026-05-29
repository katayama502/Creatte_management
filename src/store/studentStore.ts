import { create } from "zustand";
import { Student, StudentStatus } from "@/types";

interface StudentState {
  students: Student[];
  setStudents: (students: Student[]) => void;
  addStudent: (student: Omit<Student, "id" | "createdAt">) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  moveStudentStatus: (id: string, status: StudentStatus) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],

  setStudents: (students) => set({ students }),

  addStudent: (student) => {
    const newStudent: Student = {
      ...student,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ students: [newStudent, ...state.students] }));
    import('@/lib/firestore/students').then(({ createStudent }) => {
      createStudent(student).then((created) => {
        set((state) => ({
          students: state.students.map((s) => s.id === newStudent.id ? created : s),
        }));
      });
    });
  },

  updateStudent: (id, updates) => {
    set((state) => ({
      students: state.students.map((s) => s.id === id ? { ...s, ...updates } : s),
    }));
    import('@/lib/firestore/students').then(({ updateStudent }) => updateStudent(id, updates));
  },

  deleteStudent: (id) => {
    set((state) => ({ students: state.students.filter((s) => s.id !== id) }));
    import('@/lib/firestore/students').then(({ deleteStudent }) => deleteStudent(id));
  },

  moveStudentStatus: (id, status) => {
    set((state) => ({
      students: state.students.map((s) => s.id === id ? { ...s, status } : s),
    }));
    import('@/lib/firestore/students').then(({ updateStudent }) => updateStudent(id, { status }));
  },
}));
