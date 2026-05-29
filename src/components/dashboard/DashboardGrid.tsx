'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { useDashboardStore, ExtendedDashboardPanel } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';
import StatsPanel from './panels/StatsPanel';
import RecentStudentsPanel from './panels/RecentStudentsPanel';
import UpcomingLessonsPanel from './panels/UpcomingLessonsPanel';
import TeacherLoadPanel from './panels/TeacherLoadPanel';
import FeeStatusPanel from './panels/FeeStatusPanel';

function PanelContent({ type }: { type: ExtendedDashboardPanel['type'] }) {
  switch (type) {
    case 'stats': return <StatsPanel />;
    case 'recent_students': return <RecentStudentsPanel />;
    case 'upcoming_lessons': return <UpcomingLessonsPanel />;
    case 'teacher_load': return <TeacherLoadPanel />;
    case 'fee_status': return <FeeStatusPanel />;
    default: return null;
  }
}

interface SortablePanelProps {
  panel: ExtendedDashboardPanel;
  isEditing: boolean;
  onToggleVisible: (id: string) => void;
}

function SortablePanel({ panel, isEditing, onToggleVisible }: SortablePanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: panel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!panel.visible && !isEditing) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-indigo-300',
        !panel.visible && 'opacity-40'
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors p-0.5 rounded"
              aria-label="ドラッグして並び替え"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-sm font-semibold text-gray-700">{panel.title}</h2>
        </div>

        {isEditing && (
          <button
            onClick={() => onToggleVisible(panel.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded"
            aria-label={panel.visible ? 'パネルを非表示' : 'パネルを表示'}
          >
            {panel.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Panel body */}
      <div className="p-4">
        <PanelContent type={panel.type} />
      </div>
    </div>
  );
}

interface DashboardGridProps {
  isEditing: boolean;
}

export default function DashboardGrid({ isEditing }: DashboardGridProps) {
  const { panels, reorderPanels, togglePanelVisible } = useDashboardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const sortedPanels = [...panels].sort((a, b) => a.position - b.position);
  const panelIds = sortedPanels.map((p) => p.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderPanels(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={panelIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sortedPanels.map((panel) => (
            <SortablePanel
              key={panel.id}
              panel={panel}
              isEditing={isEditing}
              onToggleVisible={togglePanelVisible}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
