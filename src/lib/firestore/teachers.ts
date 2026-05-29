import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Teacher } from '@/types';

const COL = 'teachers';

export const teachersCollection = () => collection(db, COL);

export async function fetchTeachers(): Promise<Teacher[]> {
  const snap = await getDocs(query(teachersCollection(), orderBy('name', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher));
}

export async function createTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  const ref = await addDoc(teachersCollection(), teacher);
  return { id: ref.id, ...teacher };
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<void> {
  await updateDoc(doc(db, COL, id), updates as DocumentData);
}

export async function deleteTeacher(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeTeachers(callback: (teachers: Teacher[]) => void): Unsubscribe {
  return onSnapshot(
    query(teachersCollection(), orderBy('name', 'asc')),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
    }
  );
}
