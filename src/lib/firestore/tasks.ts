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
import { Task } from '@/types';

const COL = 'tasks';

export const tasksCollection = () => collection(db, COL);

export async function fetchTasks(): Promise<Task[]> {
  const snap = await getDocs(query(tasksCollection(), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const createdAt = new Date().toISOString();
  const ref = await addDoc(tasksCollection(), { ...task, createdAt });
  return { id: ref.id, ...task, createdAt };
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, COL, id), updates as DocumentData);
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeTasks(callback: (tasks: Task[]) => void): Unsubscribe {
  return onSnapshot(
    query(tasksCollection(), orderBy('createdAt', 'desc')),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
    }
  );
}
