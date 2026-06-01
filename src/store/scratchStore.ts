import { create } from 'zustand';
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, where, orderBy, DocumentData, Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScratchWork, CurriculumProgress } from '@/types';

const SCRATCH_COL = 'scratchWorks';
const CURRICULUM_COL = 'curriculumProgress';

interface ScratchState {
  works: ScratchWork[];
  curriculum: CurriculumProgress[];
  setWorks: (works: ScratchWork[]) => void;
  setCurriculum: (c: CurriculumProgress[]) => void;

  // Scratch works
  addWork: (work: Omit<ScratchWork, 'id' | 'createdAt'>) => void;
  updateWork: (id: string, updates: Partial<ScratchWork>) => void;
  deleteWork: (id: string) => void;
  getWorksByStudent: (studentId: string) => ScratchWork[];

  // Curriculum progress
  addProgress: (p: Omit<CurriculumProgress, 'id'>) => void;
  deleteProgress: (id: string) => void;
  getProgressByStudent: (studentId: string) => CurriculumProgress[];

  // Subscribe
  subscribeByStudent: (studentId: string) => () => void;
}

export const useScratchStore = create<ScratchState>((set, get) => ({
  works: [],
  curriculum: [],

  setWorks: (works) => set({ works }),
  setCurriculum: (curriculum) => set({ curriculum }),

  addWork: async (work) => {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, SCRATCH_COL), { ...work, createdAt });
    set((s) => ({ works: [{ id: ref.id, ...work, createdAt }, ...s.works] }));
  },

  updateWork: async (id, updates) => {
    set((s) => ({ works: s.works.map((w) => w.id === id ? { ...w, ...updates } : w) }));
    await updateDoc(doc(db, SCRATCH_COL, id), updates as DocumentData);
  },

  deleteWork: async (id) => {
    set((s) => ({ works: s.works.filter((w) => w.id !== id) }));
    await deleteDoc(doc(db, SCRATCH_COL, id));
  },

  getWorksByStudent: (studentId) => get().works.filter((w) => w.studentId === studentId),

  addProgress: async (p) => {
    const ref = await addDoc(collection(db, CURRICULUM_COL), p);
    set((s) => ({ curriculum: [{ id: ref.id, ...p }, ...s.curriculum] }));
  },

  deleteProgress: async (id) => {
    set((s) => ({ curriculum: s.curriculum.filter((c) => c.id !== id) }));
    await deleteDoc(doc(db, CURRICULUM_COL, id));
  },

  getProgressByStudent: (studentId) =>
    get().curriculum
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => (a.completedAt > b.completedAt ? -1 : 1)),

  subscribeByStudent: (studentId) => {
    const unsubs: Unsubscribe[] = [];

    const worksQ = query(
      collection(db, SCRATCH_COL),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    unsubs.push(onSnapshot(worksQ, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScratchWork));
      set((s) => ({
        works: [
          ...s.works.filter((w) => w.studentId !== studentId),
          ...incoming,
        ],
      }));
    }));

    const currQ = query(
      collection(db, CURRICULUM_COL),
      where('studentId', '==', studentId),
      orderBy('completedAt', 'desc')
    );
    unsubs.push(onSnapshot(currQ, (snap) => {
      const incoming = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CurriculumProgress));
      set((s) => ({
        curriculum: [
          ...s.curriculum.filter((c) => c.studentId !== studentId),
          ...incoming,
        ],
      }));
    }));

    return () => unsubs.forEach((u) => u());
  },
}));
