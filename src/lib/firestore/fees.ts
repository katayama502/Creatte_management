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
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MonthlyFee, PaymentStatus } from '@/store/feeStore';

const COL = 'fees';

export const feesCollection = () => collection(db, COL);

export async function fetchFees(): Promise<MonthlyFee[]> {
  const snap = await getDocs(query(feesCollection()));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyFee));
}

export async function fetchFeesByMonth(year: number, month: number): Promise<MonthlyFee[]> {
  const snap = await getDocs(
    query(
      feesCollection(),
      where('year', '==', year),
      where('month', '==', month)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyFee));
}

export async function createFee(fee: Omit<MonthlyFee, 'id'>): Promise<MonthlyFee> {
  const ref = await addDoc(feesCollection(), fee);
  return { id: ref.id, ...fee };
}

export async function updateFeeStatus(
  id: string,
  status: PaymentStatus,
  paidAt?: string
): Promise<void> {
  const updates: DocumentData = { status };
  if (paidAt !== undefined) {
    updates.paidAt = paidAt;
  }
  await updateDoc(doc(db, COL, id), updates);
}

export async function deleteFee(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export function subscribeFees(callback: (fees: MonthlyFee[]) => void): Unsubscribe {
  return onSnapshot(
    query(feesCollection()),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as MonthlyFee)));
    }
  );
}
