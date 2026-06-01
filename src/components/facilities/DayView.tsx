'use client';

import { useRef, useEffect } from 'react';
import { format } from 'date-fns';
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

const SLOT_HEIGHT = 48;
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

function timeToTop(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return ((h - START_HOUR) * 2 + (m >= 30 ? 1 : 0)) * SLOT_HEIGHT;
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

export default function DayView({ currentDate, reservations, facilityColor, onSlotClick, onReservationClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayReservations = reservations
    .filter((r) => r.date === dateStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * 2 * SLOT_HEIGHT;
    }
  }, []);

  const totalHeight = HOURS.length * SLOT_HEIGHT;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Date header */}
      <div className="px-6 py-3 border-b border-gray-200 shrink-0">
        <p className="text-base font-bold text-gray-900">
          {format(currentDate, 'M月d日(E)', { locale: ja })}
        </p>
        <p className="text-xs text-gray-400">{dayReservations.length}件の予約</p>
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: totalHeight }}>
          {/* Time labels */}
          <div className="w-16 shrink-0 relative border-r border-gray-200">
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

          {/* Single day column */}
          <div className="flex-1 relative">
            {HOURS.map((h, hi) => (
              <div
                key={hi}
                onClick={() => onSlotClick(dateStr, h)}
                className={cn(
                  'absolute w-full border-b cursor-pointer hover:bg-indigo-50/40 transition-colors',
                  h.endsWith(':00') ? 'border-gray-200' : 'border-gray-100 border-dashed'
                )}
                style={{ top: hi * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              />
            ))}

            {dayReservations.map((r) => {
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
                    'absolute left-2 right-2 rounded-lg px-3 py-1.5 text-left overflow-hidden z-10',
                    'text-white text-sm font-medium border-l-4 shadow-sm',
                    bgClass, borderClass,
                    'hover:brightness-90 transition-all'
                  )}
                  style={{ top: top + 1, height: height - 2 }}
                >
                  <p className="font-semibold truncate">{r.title}</p>
                  <p className="text-xs opacity-80">{r.startTime}〜{r.endTime}</p>
                  {r.reservedBy && height >= 64 && (
                    <p className="text-xs opacity-70 mt-0.5">{r.reservedBy}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
