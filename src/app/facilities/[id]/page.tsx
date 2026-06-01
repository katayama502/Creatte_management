'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  format, addMonths, subMonths, addWeeks, subWeeks,
  addDays, subDays, startOfWeek, endOfWeek, startOfMonth,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, ArrowLeft,
  Building, Users, MapPin,
} from 'lucide-react';
import { useFacilityStore } from '@/store/facilityStore';
import { FacilityReservation, FacilityColor } from '@/types';
import MonthView from '@/components/facilities/MonthView';
import WeekView from '@/components/facilities/WeekView';
import DayView from '@/components/facilities/DayView';
import ReservationModal from '@/components/facilities/ReservationModal';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';

const COLOR_BG: Record<FacilityColor, string> = {
  indigo: 'bg-indigo-500',
  blue:   'bg-blue-500',
  cyan:   'bg-cyan-500',
  teal:   'bg-teal-500',
  green:  'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red:    'bg-red-500',
  pink:   'bg-pink-500',
  purple: 'bg-purple-500',
};

interface ReservationModalState {
  open: boolean;
  reservation?: FacilityReservation;
  defaultDate?: string;
  defaultStart?: string;
  defaultEnd?: string;
}

export default function FacilityCalendarPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const facilityId = resolvedParams.id;
  const router = useRouter();
  const { facilities, reservations, setReservations, addReservation, updateReservation, deleteReservation } = useFacilityStore();

  const facility = facilities.find((f) => f.id === facilityId);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState<ReservationModalState>({ open: false });

  // Subscribe to reservations for this facility
  useEffect(() => {
    if (!facilityId) return;
    let unsub: (() => void) | undefined;
    import('@/lib/firestore/facilities').then(({ subscribeReservationsByFacility }) => {
      unsub = subscribeReservationsByFacility(facilityId, (data) => {
        setReservations(facilityId, data);
      });
    });
    return () => unsub?.();
  }, [facilityId, setReservations]);

  const facilityReservations = reservations.filter((r) => r.facilityId === facilityId);
  const facilityColor: FacilityColor = facility?.color ?? 'indigo';
  const colorBg = COLOR_BG[facilityColor];

  function navigate(dir: 1 | -1) {
    if (viewMode === 'month') {
      setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(dir === 1 ? addDays(currentDate, 1) : subDays(currentDate, 1));
    }
  }

  function getHeaderLabel(): string {
    if (viewMode === 'month') return format(currentDate, 'yyyy年M月', { locale: ja });
    if (viewMode === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 0 });
      const we = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(ws, 'M/d', { locale: ja })} 〜 ${format(we, 'M/d', { locale: ja })}`;
    }
    return format(currentDate, 'yyyy年M月d日(E)', { locale: ja });
  }

  function openNewReservation(date: string, time?: string) {
    const startTime = time ?? '09:00';
    const [h, m] = startTime.split(':').map(Number);
    const endMin = m + 30 >= 60 ? 0 : m + 30;
    const endH = m + 30 >= 60 ? h + 1 : h;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    setModal({ open: true, defaultDate: date, defaultStart: startTime, defaultEnd: endTime });
  }

  function openEditReservation(r: FacilityReservation) {
    setModal({ open: true, reservation: r });
  }

  function handleSave(data: Omit<FacilityReservation, 'id' | 'createdAt'>) {
    if (modal.reservation) {
      updateReservation(modal.reservation.id, data);
    } else {
      addReservation(data);
    }
    setModal({ open: false });
  }

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <Building className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500">施設が見つかりません</p>
        <button onClick={() => router.push('/facilities')} className="mt-4 text-indigo-600 text-sm hover:underline">
          施設一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 mb-3">
          <button
            onClick={() => router.push('/facilities')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorBg)}>
            <Building className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">{facility.name}</h1>
            <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-400 flex-wrap">
              {facility.capacity && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{facility.capacity}名</span>
              )}
              {facility.floor && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{facility.floor}</span>
              )}
              {facility.description && <span className="truncate hidden sm:block">{facility.description}</span>}
            </div>
          </div>
          <button
            onClick={() => openNewReservation(format(currentDate, 'yyyy-MM-dd'))}
            className="flex items-center gap-1 md:gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 md:px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 min-h-[36px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">予約追加</span>
          </button>
        </div>

        {/* Calendar nav */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              今日
            </button>
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h2 className="text-sm md:text-base font-semibold text-gray-900 min-w-[100px] md:min-w-[160px]">{getHeaderLabel()}</h2>
          </div>

          {/* View switcher */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm shrink-0">
            {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={cn(
                  'px-2.5 md:px-3 py-1.5 font-medium transition-colors',
                  viewMode === v ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'month' && (
          <MonthView
            currentDate={currentDate}
            reservations={facilityReservations}
            facilityColor={facilityColor}
            onSlotClick={(date) => openNewReservation(date)}
            onReservationClick={openEditReservation}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            currentDate={currentDate}
            reservations={facilityReservations}
            facilityColor={facilityColor}
            onSlotClick={openNewReservation}
            onReservationClick={openEditReservation}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            currentDate={currentDate}
            reservations={facilityReservations}
            facilityColor={facilityColor}
            onSlotClick={openNewReservation}
            onReservationClick={openEditReservation}
          />
        )}
      </div>

      {modal.open && (
        <ReservationModal
          facilityId={facilityId}
          facilityColor={facilityColor}
          reservation={modal.reservation}
          defaultDate={modal.defaultDate}
          defaultStart={modal.defaultStart}
          defaultEnd={modal.defaultEnd}
          onSave={handleSave}
          onDelete={deleteReservation}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
