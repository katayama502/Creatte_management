import { create } from 'zustand';
import { Facility, FacilityReservation } from '@/types';

interface FacilityState {
  facilities: Facility[];
  reservations: FacilityReservation[];
  setFacilities: (facilities: Facility[]) => void;
  setReservations: (facilityId: string, reservations: FacilityReservation[]) => void;
  addFacility: (data: Omit<Facility, 'id' | 'createdAt'>) => void;
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  addReservation: (data: Omit<FacilityReservation, 'id' | 'createdAt'>) => void;
  updateReservation: (id: string, updates: Partial<FacilityReservation>) => void;
  deleteReservation: (id: string) => void;
  getReservationsByFacility: (facilityId: string) => FacilityReservation[];
}

export const useFacilityStore = create<FacilityState>((set, get) => ({
  facilities: [],
  reservations: [],

  setFacilities: (facilities) => set({ facilities }),

  setReservations: (facilityId, incoming) =>
    set((state) => ({
      reservations: [
        ...state.reservations.filter((r) => r.facilityId !== facilityId),
        ...incoming,
      ],
    })),

  addFacility: (data) => {
    const temp: Facility = {
      ...data,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ facilities: [...state.facilities, temp] }));
    import('@/lib/firestore/facilities').then(({ createFacility }) => {
      createFacility(data).then((created) => {
        set((state) => ({
          facilities: state.facilities.map((f) =>
            f.id === temp.id ? created : f
          ),
        }));
      });
    });
  },

  updateFacility: (id, updates) => {
    set((state) => ({
      facilities: state.facilities.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    }));
    import('@/lib/firestore/facilities').then(({ updateFacility }) =>
      updateFacility(id, updates)
    );
  },

  deleteFacility: (id) => {
    set((state) => ({
      facilities: state.facilities.filter((f) => f.id !== id),
    }));
    import('@/lib/firestore/facilities').then(({ deleteFacility }) =>
      deleteFacility(id)
    );
  },

  addReservation: (data) => {
    const temp: FacilityReservation = {
      ...data,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ reservations: [...state.reservations, temp] }));
    import('@/lib/firestore/facilities').then(({ createReservation }) => {
      createReservation(data).then((created) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === temp.id ? created : r
          ),
        }));
      });
    });
  },

  updateReservation: (id, updates) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
    import('@/lib/firestore/facilities').then(({ updateReservation }) =>
      updateReservation(id, updates)
    );
  },

  deleteReservation: (id) => {
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    }));
    import('@/lib/firestore/facilities').then(({ deleteReservation }) =>
      deleteReservation(id)
    );
  },

  getReservationsByFacility: (facilityId) =>
    get().reservations.filter((r) => r.facilityId === facilityId),
}));
