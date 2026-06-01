'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { differenceInDays, parseISO, format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  GripVertical,
  Pencil,
  Trash2,
  FileText,
  Clock,
  History,
} from 'lucide-react';
import { Sponsor, SponsorContact } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_DOT: Record<Sponsor['status'], string> = {
  active: 'bg-green-500',
  pending: 'bg-yellow-400',
  inactive: 'bg-gray-400',
};

interface SponsorCardProps {
  sponsor: Sponsor;
  contacts: SponsorContact[];
  onEdit: (s: Sponsor) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export default function SponsorCard({
  sponsor,
  contacts,
  onEdit,
  onDelete,
  isOverlay = false,
}: SponsorCardProps) {
  const [hovered, setHovered] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sponsor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Initials avatar from company name
  const initials = sponsor.companyName
    .replace(/[株式会社|有限会社|合同会社]/g, '')
    .trim()
    .slice(0, 2) || sponsor.companyName.slice(0, 2);

  // Next contact urgency
  const daysUntilContact = sponsor.nextContactDate
    ? differenceInDays(parseISO(sponsor.nextContactDate), new Date())
    : null;

  const contactUrgency =
    daysUntilContact !== null && daysUntilContact <= 7 && sponsor.status !== 'inactive'
      ? daysUntilContact < 0
        ? 'overdue'
        : daysUntilContact === 0
        ? 'today'
        : 'soon'
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm select-none',
        'transition-all duration-150',
        isDragging && !isOverlay && 'opacity-50 ring-2 ring-indigo-300 border-dashed',
        isOverlay && 'shadow-xl ring-2 ring-indigo-300 rotate-1 scale-105',
        !isDragging && !isOverlay && 'hover:shadow-md'
      )}
    >
      <div className="flex items-stretch">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-7 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-400 transition-colors shrink-0 rounded-l-xl"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Card content */}
        <div className="flex-1 min-w-0 p-3 pr-3">
          {/* Top row: avatar + info + status dot + actions */}
          <div className="flex items-start gap-2.5">
            {/* Initials avatar */}
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-sm">
              {initials}
            </div>

            {/* Name / contact / industry */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                {sponsor.companyName}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {sponsor.contactName}
                {sponsor.industry && (
                  <span className="text-gray-400"> · {sponsor.industry}</span>
                )}
              </p>
            </div>

            {/* Status dot + action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <span
                className={cn(
                  'w-2 h-2 rounded-full mt-0.5',
                  STATUS_DOT[sponsor.status]
                )}
              />
              {(hovered || isOverlay) && (
                <div
                  className="flex items-center gap-0.5 ml-1"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEdit(sponsor)}
                    className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(sponsor.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          {sponsor.amount > 0 && (
            <p className="text-base font-bold text-gray-800 mt-2">
              ¥{sponsor.amount.toLocaleString()}
              <span className="text-xs font-normal text-gray-400 ml-1">/ 年</span>
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {/* Flier badge */}
            {sponsor.fliersPlaced && (
              <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-medium">
                <FileText className="w-3 h-3" />
                チラシ設置済
              </span>
            )}

            {/* Next contact urgency badge */}
            {contactUrgency && daysUntilContact !== null && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md font-medium',
                  contactUrgency === 'overdue'
                    ? 'bg-red-50 text-red-600'
                    : contactUrgency === 'today'
                    ? 'bg-orange-50 text-orange-600'
                    : 'bg-yellow-50 text-yellow-600'
                )}
              >
                <Clock className="w-3 h-3" />
                {contactUrgency === 'overdue'
                  ? `${Math.abs(daysUntilContact)}日超過`
                  : contactUrgency === 'today'
                  ? '本日予定'
                  : `${daysUntilContact}日後`}
                {sponsor.nextContactDate && (
                  <span className="opacity-70">
                    ({format(parseISO(sponsor.nextContactDate), 'M/d', { locale: ja })})
                  </span>
                )}
              </span>
            )}

            {/* History count badge */}
            {contacts.length > 0 && (
              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                <History className="w-3 h-3" />
                履歴 {contacts.length}件
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
