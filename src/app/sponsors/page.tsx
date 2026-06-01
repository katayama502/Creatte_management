'use client';

import { useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import {
  Building2,
  Plus,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useSponsorStore } from '@/store/sponsorStore';
import { Sponsor, SponsorContact, SponsorStatus } from '@/types';
import SponsorModal from '@/components/sponsors/SponsorModal';
import SponsorCard from '@/components/sponsors/SponsorCard';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────

const SPONSOR_GOAL = 100;

const COLUMNS: {
  status: SponsorStatus;
  label: string;
  bgColor: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  addBtnColor: string;
}[] = [
  {
    status: 'pending',
    label: '検討中',
    bgColor: 'bg-yellow-50',
    headerBg: 'bg-yellow-100',
    headerText: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    addBtnColor: 'text-yellow-700 hover:bg-yellow-200',
  },
  {
    status: 'active',
    label: '協賛中',
    bgColor: 'bg-green-50',
    headerBg: 'bg-green-100',
    headerText: 'text-green-800',
    borderColor: 'border-green-200',
    addBtnColor: 'text-green-700 hover:bg-green-200',
  },
  {
    status: 'inactive',
    label: '終了',
    bgColor: 'bg-gray-50',
    headerBg: 'bg-gray-200',
    headerText: 'text-gray-700',
    borderColor: 'border-gray-200',
    addBtnColor: 'text-gray-600 hover:bg-gray-300',
  },
];

// ─── Progress gauge ───────────────────────────────────────────

function SponsorProgressGauge({ total, active }: { total: number; active: number }) {
  const pct = Math.min(Math.round((active / SPONSOR_GOAL) * 100), 100);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-700">協賛企業 達成状況</h2>
        </div>
        <span className="text-2xl font-bold text-indigo-700">
          {active}
          <span className="text-sm text-gray-400 font-normal"> / {SPONSOR_GOAL}社</span>
        </span>
      </div>
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>目標 {SPONSOR_GOAL}社</span>
        <span className="font-semibold text-indigo-600">{pct}% 達成</span>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-sm">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">{active}</p>
          <p className="text-xs text-gray-400">協賛中</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-yellow-600">{total - active}</p>
          <p className="text-xs text-gray-400">検討中/終了</p>
        </div>
        <div className="text-center ml-auto">
          <p className="text-xl font-bold text-gray-900">{SPONSOR_GOAL - active}</p>
          <p className="text-xs text-gray-400">残り目標</p>
        </div>
      </div>
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────

interface DroppableColumnProps {
  status: SponsorStatus;
  label: string;
  bgColor: string;
  headerBg: string;
  headerText: string;
  borderColor: string;
  addBtnColor: string;
  sponsors: Sponsor[];
  isDraggingOver: boolean;
  onAdd: (status: SponsorStatus) => void;
  onEdit: (s: Sponsor) => void;
  onDelete: (id: string) => void;
  getContacts: (id: string) => SponsorContact[];
}

function DroppableColumn({
  status,
  label,
  bgColor,
  headerBg,
  headerText,
  borderColor,
  addBtnColor,
  sponsors,
  isDraggingOver,
  onAdd,
  onEdit,
  onDelete,
  getContacts,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  const totalAmount = sponsors.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border-2 transition-all duration-200 min-w-[280px] flex-1 max-h-[calc(100vh-320px)]',
        bgColor,
        borderColor,
        isDraggingOver && 'border-indigo-400 shadow-lg scale-[1.01]'
      )}
    >
      {/* Column header */}
      <div className={cn('px-4 py-3 rounded-t-xl', headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('font-semibold text-sm', headerText)}>{label}</span>
            <span className="bg-white bg-opacity-70 text-xs font-bold px-2 py-0.5 rounded-full text-gray-700">
              {sponsors.length}
            </span>
          </div>
          <button
            onClick={() => onAdd(status)}
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors',
              addBtnColor
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        </div>
        {totalAmount > 0 && (
          <p className={cn('text-xs mt-1 font-medium', headerText, 'opacity-70')}>
            ¥{totalAmount.toLocaleString()} / 年
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-2 transition-colors duration-200',
          isDraggingOver && 'bg-indigo-50 bg-opacity-60'
        )}
      >
        <SortableContext
          items={sponsors.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              contacts={getContacts(sponsor.id)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {sponsors.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            ここにドロップ
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function SponsorsPage() {
  const {
    sponsors,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    setSponsorStatus,
    reorderSponsors,
    getContactsBySponsor,
  } = useSponsorStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<SponsorStatus>('pending');
  const [activeSponsor, setActiveSponsor] = useState<Sponsor | null>(null);
  const [overColumn, setOverColumn] = useState<SponsorStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeCount = sponsors.filter((s) => s.status === 'active').length;
  const totalActiveAmount = sponsors
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const upcomingContacts = sponsors.filter((s) => {
    if (!s.nextContactDate || s.status === 'inactive') return false;
    const days = differenceInDays(parseISO(s.nextContactDate), new Date());
    return days >= 0 && days <= 7;
  }).length;

  const getSponsorsByStatus = (status: SponsorStatus) =>
    sponsors.filter((s) => s.status === status);

  function openAdd(status: SponsorStatus) {
    setEditingSponsor(undefined);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function openEdit(sponsor: Sponsor) {
    setEditingSponsor(sponsor);
    setDefaultStatus(sponsor.status);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Sponsor, 'id' | 'createdAt'>) {
    if (editingSponsor) {
      updateSponsor(editingSponsor.id, data);
    } else {
      addSponsor(data);
    }
    setModalOpen(false);
    setEditingSponsor(undefined);
  }

  function handleDragStart(event: DragStartEvent) {
    const sponsor = sponsors.find((s) => s.id === event.active.id);
    setActiveSponsor(sponsor ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) { setOverColumn(null); return; }
    const overId = over.id as string;
    const isCol = COLUMNS.some((c) => c.status === overId);
    if (isCol) {
      setOverColumn(overId as SponsorStatus);
    } else {
      const overSponsor = sponsors.find((s) => s.id === overId);
      if (overSponsor) setOverColumn(overSponsor.status);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveSponsor(null);
    setOverColumn(null);
    if (!over) return;

    const sponsorId = active.id as string;
    const overId = over.id as string;

    const isCol = COLUMNS.some((c) => c.status === overId);
    let targetStatus: SponsorStatus;

    if (isCol) {
      targetStatus = overId as SponsorStatus;
    } else {
      const overSponsor = sponsors.find((s) => s.id === overId);
      if (!overSponsor) return;
      targetStatus = overSponsor.status;
    }

    const dragged = sponsors.find((s) => s.id === sponsorId);
    if (!dragged) return;

    if (dragged.status !== targetStatus) {
      setSponsorStatus(sponsorId, targetStatus);
    } else if (sponsorId !== overId) {
      reorderSponsors(sponsorId, overId);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">協賛企業管理</h1>
            </div>
            <p className="text-sm text-gray-500">全 {sponsors.length} 社</p>
          </div>
          <button
            onClick={() => openAdd('pending')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            企業を追加
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />協賛中 {activeCount}社
          </span>
          {totalActiveAmount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
              <TrendingUp className="w-3.5 h-3.5" />年間協賛額 ¥{totalActiveAmount.toLocaleString()}
            </span>
          )}
          {upcomingContacts > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium text-xs">
              <Clock className="w-3.5 h-3.5" />今週コンタクト予定 {upcomingContacts}社
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 min-h-0">
        <SponsorProgressGauge total={sponsors.length} active={activeCount} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-2 flex-1">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.status}
                {...col}
                sponsors={getSponsorsByStatus(col.status)}
                isDraggingOver={overColumn === col.status}
                onAdd={openAdd}
                onEdit={openEdit}
                onDelete={deleteSponsor}
                getContacts={getContactsBySponsor}
              />
            ))}
          </div>

          <DragOverlay>
            {activeSponsor ? (
              <div className="opacity-90">
                <SponsorCard
                  sponsor={activeSponsor}
                  contacts={getContactsBySponsor(activeSponsor.id)}
                  onEdit={openEdit}
                  onDelete={deleteSponsor}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {modalOpen && (
        <SponsorModal
          sponsor={editingSponsor}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingSponsor(undefined); }}
        />
      )}
    </div>
  );
}
