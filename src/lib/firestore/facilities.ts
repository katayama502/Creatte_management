import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Facility, FacilityReservation } from '@/types';

// ── Facilities ────────────────────────────────────────────────

function toFacility(id: string, data: Record<string, unknown>): Facility {
  return {
    id,
    name: data.name as string,
    description: data.description as string | undefined,
    capacity: data.capacity as number | undefined,
    color: (data.color as Facility['color']) ?? 'indigo',
    floor: data.floor as string | undefined,
    notes: data.notes as string | undefined,
    active: (data.active as boolean) ?? true,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
  };
}

export function subscribeFacilities(
  onData: (facilities: Facility[]) => void
): () => void {
  const q = query(collection(db, 'facilities'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => toFacility(d.id, d.data())));
  });
}

export async function createFacility(
  data: Omit<Facility, 'id' | 'createdAt'>
): Promise<Facility> {
  const ref = await addDoc(collection(db, 'facilities'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { ...data, id: ref.id, createdAt: new Date().toISOString() };
}

export async function updateFacility(
  id: string,
  updates: Partial<Facility>
): Promise<void> {
  await updateDoc(doc(db, 'facilities', id), updates as Record<string, unknown>);
}

export async function deleteFacility(id: string): Promise<void> {
  await deleteDoc(doc(db, 'facilities', id));
}

// ── FacilityReservations ──────────────────────────────────────

function toReservation(
  id: string,
  data: Record<string, unknown>
): FacilityReservation {
  return {
    id,
    facilityId: data.facilityId as string,
    title: data.title as string,
    date: data.date as string,
    startTime: data.startTime as string,
    endTime: data.endTime as string,
    reservedBy: data.reservedBy as string | undefined,
    description: data.description as string | undefined,
    color: data.color as FacilityReservation['color'],
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) ?? new Date().toISOString(),
  };
}

export function subscribeReservationsByFacility(
  facilityId: string,
  onData: (reservations: FacilityReservation[]) => void
): () => void {
  const q = query(
    collection(db, 'facilityReservations'),
    where('facilityId', '==', facilityId),
    orderBy('date', 'asc'),
    orderBy('startTime', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => toReservation(d.id, d.data())));
  });
}

export async function createReservation(
  data: Omit<FacilityReservation, 'id' | 'createdAt'>
): Promise<FacilityReservation> {
  const ref = await addDoc(collection(db, 'facilityReservations'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { ...data, id: ref.id, createdAt: new Date().toISOString() };
}

export async function updateReservation(
  id: string,
  updates: Partial<FacilityReservation>
): Promise<void> {
  await updateDoc(
    doc(db, 'facilityReservations', id),
    updates as Record<string, unknown>
  );
}

export async function deleteReservation(id: string): Promise<void> {
  await deleteDoc(doc(db, 'facilityReservations', id));
}
