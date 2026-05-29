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
import { Student } from '@/types';

const COL = 'students';

export const studentsCollection = () => collection(db, COL);

export async function fetchStudents(): Promise<Student[]> {
  const snap = await getDocs(query(studentsCollection(), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
}

export async function createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
  const createdAt = new Date().toISOString();
  const ref = await addDoc(studentsCollection(), {
    ...student,
    createdAt,
  });
  return { id: ref.id, ...student, createdAt };
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  await updateDoc(doc(db, COL, id), updates as DocumentData);
}

export async function deleteStudent(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
  return onSnapshot(
    query(studentsCollection(), orderBy('createdAt', 'desc')),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    }
  );
}
