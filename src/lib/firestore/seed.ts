// This file can be imported and called from a browser console or an admin page
// Usage: import { seedFirestore } from '@/lib/firestore/seed'; seedFirestore();
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

export async function seedFirestore() {
  // Minimal seed data defined inline (does not import from stores)
  const teachers = [
    {
      id: 't1',
      name: '中村 由紀',
      nameKana: 'ナカムラ ユキ',
      email: 'nakamura@kurietto.jp',
      phone: '03-1234-5678',
      availableDays: [1, 3, 5],
      subjects: ['Scratch', 'Canva'],
      color: '#6366f1',
      maxStudents: 20,
    },
    {
      id: 't2',
      name: '渡辺 純',
      nameKana: 'ワタナベ ジュン',
      email: 'watanabe@kurietto.jp',
      phone: '03-2345-6789',
      availableDays: [2, 4, 6],
      subjects: ['Scratch', 'Mbot'],
      color: '#f97316',
      maxStudents: 18,
    },
    {
      id: 't3',
      name: '木村 澪',
      nameKana: 'キムラ ミオ',
      email: 'kimura@kurietto.jp',
      phone: '03-3456-7890',
      availableDays: [1, 2, 4],
      subjects: ['Canva', 'Mbot'],
      color: '#10b981',
      maxStudents: 15,
    },
  ];

  const batch = writeBatch(db);
  for (const t of teachers) {
    const { id, ...data } = t;
    batch.set(doc(collection(db, 'teachers'), id), data);
  }
  await batch.commit();
  console.log('Seed complete');
}
