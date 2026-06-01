'use client';

import { useRef, useEffect, useState } from 'react';
import {
  startOfWeek, addDays, subDays, format, isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { FacilityReservation, FacilityColor } from '@/types';
import { cn } from '@/lib/utils';

const COLOR_BG: Record<FacilityColor, string> = {
  indigo: 'bg-indigo-500',
  blue:   'bg-blue-500',
  cyan:   'bg-cyan-500',
  teal:   'bg-teal-500',
  green:  'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red:    'bg-red-500',
  pink:   'bg-pink-500',
  purple: 'bg-purple-500',
};

const COLOR_BORDER: Record<FacilityColor, string> = {
  indigo: 'border-indigo-600',
  blue:   'border-blue-600',
  cyan:   'border-cyan-600',
  teal:   'border-teal-600',
  green:  'border-green-600',
  yellow: 'border-yellow-500',
  orange: 'border-orange-600',
  red:    'border-red-600',
  pink:   'border-pink-600',
  purple: 'border-purple-600',
};

const SLOT_HEIGHT = 40; // px per 30-min slot
const START_HOUR = 6;
const END_HOUR = 23;

function generateHours() {
  const hours: string[] = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
    if (h < END_HOUR) hours.push(`${String(h).padStart(2, '0')}:30`);
  }
  return hours;
}
const HOURS = generateHours();

function timeToSlotIndex(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * 2 + (m >= 30 ? 1 : 0);
}

function slotToTop(slotIndex: number): number {
  return slotIndex * SLOT_HEIGHT;
}

function timeToTop(time: string): number {
  return slotToTop(timeToSlotIndex(time));
}

function timeToHeight(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diffMins = (eh * 60 + em) - (sh * 60 + sm);
  return (diffMins / 30) * SLOT_HEIGHT;
}

interface Props {
  currentDate: Date;
  reservations: FacilityReservation[];
  facilityColor: FacilityColor;
  onSlotClick: (date: string, time: string) => void;
  onReservationClick: (r: FacilityReservation) => void;
}

export default function WeekView({ currentDate, reservations, facilityColor, onSlotClick, onReservationClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile: 3 days centered on currentDate. Desktop: full week starting Sunday.
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = isMobile
    ? [subDays(currentDate, 1), currentDate, addDays(currentDate, 1)]
    : Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];

  useEffect(() => {
    // Scroll to 8am on mount
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * 2 * SLOT_HEIGHT;
    }
  }, []);

  function getReservationsForDay(day: Date): FacilityReservation[] {
    const d = format(day, 'yyyy-MM-dd');
    return reservations.filter((r) => r.date === d);
  }

  const totalHeight = HOURS.length * SLOT_HEIGHT;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header row */}
      <div className="flex border-b border-gray-200 shrink-0">
        <div className="w-10 sm:w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const todayDay = isToday(day);
          const dow = day.getDay(); // 0=Sun, 6=Sat
          return (
            <div key={i} className="flex-1 py-2 text-center border-l border-gray-100 first:border-0">
              <p className={cn(
                'text-xs',
                dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-500'
              )}>
                {DOW[dow]}
              </p>
              <div className="flex justify-center mt-0.5">
                <span className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold',
                  todayDay ? 'bg-indigo-600 text-white' : 'text-gray-900'
                )}>
                  {format(day, 'd')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: totalHeight }}>
          {/* Time labels */}
          <div className="w-10 sm:w-14 shrink-0 relative">
            {HOURS.map((h, i) => (
              h.endsWith(':00') && (
                <div
                  key={i}
                  className="absolute right-2 text-xs text-gray-400 -translate-y-2.5"
                  style={{ top: i * SLOT_HEIGHT }}
                >
                  {h}
                </div>
              )
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, di) => {
            const dayRes = getReservationsForDay(day);
            return (
              <div key={di} className="flex-1 relative border-l border-gray-100">
                {/* Slot lines */}
                {HOURS.map((h, hi) => (
                  <div
                    key={hi}
                    onClick={() => onSlotClick(format(day, 'yyyy-MM-dd'), h)}
                    className={cn(
                      'absolute w-full border-b cursor-pointer hover:bg-indigo-50/50 transition-colors',
                      h.endsWith(':00') ? 'border-gray-200' : 'border-gray-100 border-dashed'
                    )}
                    style={{ top: hi * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  />
                ))}

                {/* Reservation blocks */}
                {dayRes.map((r) => {
                  const color = r.color ?? facilityColor;
                  const bgClass = COLOR_BG[color] ?? COLOR_BG.indigo;
                  const borderClass = COLOR_BORDER[color] ?? COLOR_BORDER.indigo;
                  const top = timeToTop(r.startTime);
                  const height = Math.max(timeToHeight(r.startTime, r.endTime), SLOT_HEIGHT / 2);
                  return (
                    <button
                      key={r.id}
                      onClick={(e) => { e.stopPropagation(); onReservationClick(r); }}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left overflow-hidden',
                        'text-white text-xs font-medium z-10 border-l-4',
                        bgClass, borderClass,
                        'hover:brightness-90 transition-all shadow-sm'
                      )}
                      style={{ top: top + 1, height: height - 2 }}
                    >
                      <p className="truncate font-semibold">{r.title}</p>
                      {height >= 32 && (
                        <p className="truncate opacity-80">{r.startTime}〜{r.endTime}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
