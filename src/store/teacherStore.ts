import { create } from "zustand";
import { Teacher } from "@/types";

interface TeacherState {
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  teachers: [],

  setTeachers: (teachers) => set({ teachers }),

  addTeacher: (teacher) => {
    const newTeacher: Teacher = {
      ...teacher,
      id: 'temp-' + Date.now(),
    };
    set((state) => ({ teachers: [newTeacher, ...state.teachers] }));
    import('@/lib/firestore/teachers').then(({ createTeacher }) => {
      createTeacher(teacher).then((created) => {
        set((state) => ({
          teachers: state.teachers.map((t) => t.id === newTeacher.id ? created : t),
        }));
      });
    });
  },

  updateTeacher: (id, updates) => {
    set((state) => ({
      teachers: state.teachers.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));
    import('@/lib/firestore/teachers').then(({ updateTeacher }) => updateTeacher(id, updates));
  },

  deleteTeacher: (id) => {
    set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) }));
    import('@/lib/firestore/teachers').then(({ deleteTeacher }) => deleteTeacher(id));
  },
}));
