'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Plus, Users, MapPin, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useFacilityStore } from '@/store/facilityStore';
import { Facility, FacilityColor } from '@/types';
import FacilityModal from '@/components/facilities/FacilityModal';
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

const COLOR_LIGHT: Record<FacilityColor, string> = {
  indigo: 'bg-indigo-50 border-indigo-200',
  blue:   'bg-blue-50 border-blue-200',
  cyan:   'bg-cyan-50 border-cyan-200',
  teal:   'bg-teal-50 border-teal-200',
  green:  'bg-green-50 border-green-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  orange: 'bg-orange-50 border-orange-200',
  red:    'bg-red-50 border-red-200',
  pink:   'bg-pink-50 border-pink-200',
  purple: 'bg-purple-50 border-purple-200',
};

const COLOR_TEXT: Record<FacilityColor, string> = {
  indigo: 'text-indigo-700',
  blue:   'text-blue-700',
  cyan:   'text-cyan-700',
  teal:   'text-teal-700',
  green:  'text-green-700',
  yellow: 'text-yellow-700',
  orange: 'text-orange-700',
  red:    'text-red-700',
  pink:   'text-pink-700',
  purple: 'text-purple-700',
};

export default function FacilitiesPage() {
  const router = useRouter();
  const { facilities, addFacility, updateFacility, deleteFacility } = useFacilityStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleSave(data: Omit<Facility, 'id' | 'createdAt'>) {
    if (editingFacility) {
      updateFacility(editingFacility.id, data);
    } else {
      addFacility(data);
    }
    setModalOpen(false);
    setEditingFacility(undefined);
  }

  function openEdit(f: Facility, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingFacility(f);
    setModalOpen(true);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmDelete(id);
  }

  const active = facilities.filter((f) => f.active);
  const inactive = facilities.filter((f) => !f.active);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Building className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">施設管理</h1>
            </div>
            <p className="text-sm text-gray-500">全 {facilities.length} 施設（使用可能 {active.length}）</p>
          </div>
          <button
            onClick={() => { setEditingFacility(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">施設を追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 md:p-6">
        {facilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">施設が登録されていません</h2>
            <p className="text-sm text-gray-500 mb-6">まず施設を追加してください</p>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              施設を追加
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">使用可能</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {active.map((f) => (
                    <FacilityCard
                      key={f.id}
                      facility={f}
                      onClick={() => router.push(`/facilities/${f.id}`)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}
            {inactive.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">使用不可</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-60">
                  {inactive.map((f) => (
                    <FacilityCard
                      key={f.id}
                      facility={f}
                      onClick={() => router.push(`/facilities/${f.id}`)}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <FacilityModal
          facility={editingFacility}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingFacility(undefined); }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">施設を削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-5">この操作は取り消せません。予約データも削除されます。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => { deleteFacility(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FacilityCard({
  facility,
  onClick,
  onEdit,
  onDelete,
}: {
  facility: Facility;
  onClick: () => void;
  onEdit: (f: Facility, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const bgDot = COLOR_BG[facility.color] ?? COLOR_BG.indigo;
  const lightBg = COLOR_LIGHT[facility.color] ?? COLOR_LIGHT.indigo;
  const textColor = COLOR_TEXT[facility.color] ?? COLOR_TEXT.indigo;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] group',
        lightBg
      )}
    >
      {/* Color dot + name */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgDot)}>
          <Building className="w-5 h-5 text-white" />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onEdit(facility, e)}
            className="p-1.5 rounded-lg bg-white/80 text-gray-500 hover:text-indigo-600 hover:bg-white transition-colors shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => onDelete(facility.id, e)}
            className="p-1.5 rounded-lg bg-white/80 text-gray-500 hover:text-red-600 hover:bg-white transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className={cn('font-bold text-base mb-1', textColor)}>{facility.name}</h3>
      {facility.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{facility.description}</p>
      )}

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        {facility.capacity && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {facility.capacity}名
          </span>
        )}
        {facility.floor && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {facility.floor}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end mt-3">
        <ChevronRight className={cn('w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity', textColor)} />
      </div>
    </div>
  );
}
