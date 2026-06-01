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
  where,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sponsor, SponsorContact } from '@/types';

const SPONSORS_COL = 'sponsors';
const CONTACTS_COL = 'sponsorContacts';

export const sponsorsCollection = () => collection(db, SPONSORS_COL);
export const sponsorContactsCollection = () => collection(db, CONTACTS_COL);

// ─── Sponsors ───────────────────────────────────────────────

export async function fetchSponsors(): Promise<Sponsor[]> {
  const snap = await getDocs(query(sponsorsCollection(), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor));
}

export async function createSponsor(sponsor: Omit<Sponsor, 'id' | 'createdAt'>): Promise<Sponsor> {
  const createdAt = new Date().toISOString();
  const ref = await addDoc(sponsorsCollection(), { ...sponsor, createdAt });
  return { id: ref.id, ...sponsor, createdAt };
}

export async function updateSponsor(id: string, updates: Partial<Sponsor>): Promise<void> {
  await updateDoc(doc(db, SPONSORS_COL, id), updates as DocumentData);
}

export async function deleteSponsor(id: string): Promise<void> {
  await deleteDoc(doc(db, SPONSORS_COL, id));
}

export function subscribeSponsors(callback: (sponsors: Sponsor[]) => void): Unsubscribe {
  return onSnapshot(
    query(sponsorsCollection(), orderBy('createdAt', 'desc')),
    (snap: QuerySnapshot<DocumentData>) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Sponsor)));
    }
  );
}

// ─── Sponsor Contacts ────────────────────────────────────────

export async function fetchSponsorContacts(sponsorId: string): Promise<SponsorContact[]> {
  const snap = await getDocs(
    query(sponsorContactsCollection(), where('sponsorId', '==', sponsorId), orderBy('date', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SponsorContact));
}

export async function createSponsorContact(
  contact: Omit<SponsorContact, 'id' | 'createdAt'>
): Promise<SponsorContact> {
  const createdAt = new Date().toISOString();
  const ref = await addDoc(sponsorContactsCollection(), { ...contact, createdAt });
  return { id: ref.id, ...contact, createdAt };
}

export async function deleteSponsorContact(id: string): Promise<void> {
  await deleteDoc(doc(db, CONTACTS_COL, id));
}
