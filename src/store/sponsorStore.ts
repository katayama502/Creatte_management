import { create } from 'zustand';
import { Sponsor, SponsorContact, SponsorStatus } from '@/types';

interface SponsorState {
  sponsors: Sponsor[];
  contacts: SponsorContact[];
  setSponsors: (sponsors: Sponsor[]) => void;
  setContacts: (contacts: SponsorContact[]) => void;
  addSponsor: (sponsor: Omit<Sponsor, 'id' | 'createdAt'>) => void;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  deleteSponsor: (id: string) => void;
  setSponsorStatus: (id: string, status: SponsorStatus) => void;
  addContact: (contact: Omit<SponsorContact, 'id' | 'createdAt'>) => void;
  deleteContact: (id: string) => void;
  getContactsBySponsor: (sponsorId: string) => SponsorContact[];
}

export const useSponsorStore = create<SponsorState>((set, get) => ({
  sponsors: [],
  contacts: [],

  setSponsors: (sponsors) => set({ sponsors }),
  setContacts: (contacts) => set({ contacts }),

  addSponsor: (sponsor) => {
    const newSponsor: Sponsor = {
      ...sponsor,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ sponsors: [newSponsor, ...state.sponsors] }));
    import('@/lib/firestore/sponsors').then(({ createSponsor }) => {
      createSponsor(sponsor).then((created) => {
        set((state) => ({
          sponsors: state.sponsors.map((s) => s.id === newSponsor.id ? created : s),
        }));
      });
    });
  },

  updateSponsor: (id, updates) => {
    set((state) => ({
      sponsors: state.sponsors.map((s) => s.id === id ? { ...s, ...updates } : s),
    }));
    import('@/lib/firestore/sponsors').then(({ updateSponsor }) => updateSponsor(id, updates));
  },

  deleteSponsor: (id) => {
    set((state) => ({ sponsors: state.sponsors.filter((s) => s.id !== id) }));
    import('@/lib/firestore/sponsors').then(({ deleteSponsor }) => deleteSponsor(id));
  },

  setSponsorStatus: (id, status) => {
    set((state) => ({
      sponsors: state.sponsors.map((s) => s.id === id ? { ...s, status } : s),
    }));
    import('@/lib/firestore/sponsors').then(({ updateSponsor }) => updateSponsor(id, { status }));
  },

  addContact: (contact) => {
    const newContact: SponsorContact = {
      ...contact,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ contacts: [newContact, ...state.contacts] }));
    import('@/lib/firestore/sponsors').then(({ createSponsorContact }) => {
      createSponsorContact(contact).then((created) => {
        set((state) => ({
          contacts: state.contacts.map((c) => c.id === newContact.id ? created : c),
        }));
      });
    });
  },

  deleteContact: (id) => {
    set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) }));
    import('@/lib/firestore/sponsors').then(({ deleteSponsorContact }) => deleteSponsorContact(id));
  },

  getContactsBySponsor: (sponsorId) => {
    return get().contacts.filter((c) => c.sponsorId === sponsorId);
  },
}));
