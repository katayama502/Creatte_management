import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lesson } from '@/types';

const COL = 'lessons';

export const lessonsCollection = () => collection(db, COL);

export async function fetchLessons(): Promise<Lesson[]> {
  const snap = await getDocs(query(lessonsCollection(), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
}

export async function fetchLessonsByMonth(year: number, month: number): Promise<Lesson[]> {
  const mm = String(month).padStart(2, '0');
  const dateStart = `${year}-${mm}-01`;
  const dateEnd = `${year}-${mm}-31`;
  const snap = await getDocs(
    query(
      lessonsCollection(),
      where('date', '>=', dateStart),
      where('date', '<=', dateEnd),
      orderBy('date', 'asc')
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson));
}

export async function createLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
  const ref = await addDoc(lessonsCollection(), lesson);
  return { id: ref.id, ...lesson };
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<void> {
  await updateDoc(doc(db, COL, id), updates as DocumentData);
}

export async function deleteLesson(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeLessons(callback: (lessons: Lesson[]) => void): Unsubscribe {
  return onSnapshot(
    query(lessonsCollection(), orderBy('date', 'desc')),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)));
    }
  );
}
