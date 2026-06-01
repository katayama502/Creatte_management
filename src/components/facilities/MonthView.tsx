'use client';

import { useState } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, parseISO, isToday,
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
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red:    'bg-red-500',
  pink:   'bg-pink-500',
  purple: 'bg-purple-500',
};

interface Props {
  currentDate: Date;
  reservations: FacilityReservation[];
  facilityColor: FacilityColor;
  onSlotClick: (date: string) => void;
  onReservationClick: (r: FacilityReservation) => void;
}

export default function MonthView({ currentDate, reservations, facilityColor, onSlotClick, onReservationClick }: Props) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const DOW = ['日', '月', '火', '水', '木', '金', '土'];

  function getReservationsForDay(day: Date): FacilityReservation[] {
    const d = format(day, 'yyyy-MM-dd');
    return reservations
      .filter((r) => r.date === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              'py-2 text-center text-xs font-semibold',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-gray-100">
        {days.map((day, idx) => {
          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const todayDay = isToday(day);
          const dow = day.getDay();

          return (
            <div
              key={idx}
              onClick={() => onSlotClick(format(day, 'yyyy-MM-dd'))}
              className={cn(
                'min-h-[100px] p-1 border-b border-gray-100 cursor-pointer transition-colors',
                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50',
                'group'
              )}
            >
              <div className="flex justify-center mb-1">
                <span
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium',
                    todayDay && 'bg-indigo-600 text-white',
                    !todayDay && isCurrentMonth && dow === 0 && 'text-red-500',
                    !todayDay && isCurrentMonth && dow === 6 && 'text-blue-500',
                    !todayDay && isCurrentMonth && dow !== 0 && dow !== 6 && 'text-gray-700',
                    !isCurrentMonth && 'text-gray-300'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayReservations.slice(0, 3).map((r) => {
                  const color = r.color ?? facilityColor;
                  const bgClass = COLOR_BG[color] ?? COLOR_BG.indigo;
                  return (
                    <button
                      key={r.id}
                      onClick={(e) => { e.stopPropagation(); onReservationClick(r); }}
                      className={cn(
                        'w-full text-left text-white text-[10px] px-1.5 py-0.5 rounded truncate font-medium',
                        bgClass
                      )}
                    >
                      {r.startTime} {r.title}
                    </button>
                  );
                })}
                {dayReservations.length > 3 && (
                  <p className="text-[10px] text-gray-400 px-1">+{dayReservations.length - 3}件</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
