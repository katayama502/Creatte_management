'use client';

import { useState, useMemo } from 'react';
import { parseISO, isToday, isPast } from 'date-fns';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  Filter,
  Circle,
  PlayCircle,
  Check,
} from 'lucide-react';
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
import { useTaskStore } from '@/store/taskStore';
import { useTeacherStore } from '@/store/teacherStore';
import { Task, TaskStatus, TaskCategory } from '@/types';
import TaskModal from '@/components/tasks/TaskModal';
import TaskCard from '@/components/tasks/TaskCard';
import { cn } from '@/lib/utils';

// ─── Column config ────────────────────────────────────────────

interface ColumnConfig {
  status: TaskStatus;
  label: string;
  bgColor: string;
  headerColor: string;
  borderColor: string;
  icon: React.ReactNode;
  addButtonColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'pending',
    label: '未着手',
    bgColor: 'bg-gray-50',
    headerColor: 'bg-gray-200 text-gray-700',
    borderColor: 'border-gray-200',
    icon: <Circle className="w-4 h-4" />,
    addButtonColor: 'hover:bg-gray-300 text-gray-600',
  },
  {
    status: 'in_progress',
    label: '進行中',
    bgColor: 'bg-blue-50',
    headerColor: 'bg-blue-200 text-blue-800',
    borderColor: 'border-blue-200',
    icon: <PlayCircle className="w-4 h-4" />,
    addButtonColor: 'hover:bg-blue-300 text-blue-700',
  },
  {
    status: 'completed',
    label: '完了',
    bgColor: 'bg-green-50',
    headerColor: 'bg-green-200 text-green-800',
    borderColor: 'border-green-200',
    icon: <Check className="w-4 h-4" />,
    addButtonColor: 'hover:bg-green-300 text-green-700',
  },
];

// ─── Droppable column ─────────────────────────────────────────

interface DroppableColumnProps extends ColumnConfig {
  tasks: Task[];
  isDraggingOver: boolean;
  getAssigneeName: (id?: string) => string | undefined;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTask: (status: TaskStatus) => void;
}

function DroppableColumn({
  status,
  label,
  bgColor,
  headerColor,
  borderColor,
  icon,
  addButtonColor,
  tasks,
  isDraggingOver,
  getAssigneeName,
  onEdit,
  onDelete,
  onAddTask,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border-2 transition-all duration-200 min-w-[260px] w-[260px] sm:min-w-[300px] sm:w-[300px]',
        'max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-220px)]',
        bgColor,
        borderColor,
        isDraggingOver && 'border-indigo-400 shadow-lg scale-[1.01]'
      )}
    >
      {/* Column header */}
      <div className={cn('flex items-center justify-between px-4 py-3 rounded-t-xl', headerColor)}>
        <span className="flex items-center gap-1.5 font-semibold text-sm">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-white bg-opacity-70 text-xs font-bold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
          <button
            onClick={() => onAddTask(status)}
            className={cn(
              'w-6 h-6 flex items-center justify-center rounded-full transition-colors text-lg font-medium leading-none',
              addButtonColor
            )}
            title={`${label}にタスクを追加`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto p-3 space-y-2 transition-colors duration-200',
          isDraggingOver && 'bg-indigo-50/50'
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assigneeName={getAssigneeName(task.assigneeId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            ここにドロップ
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTaskStore();
  const teachers = useTeacherStore((s) => s.teachers);

  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('pending');

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getAssigneeName = (id?: string) =>
    id ? teachers.find((t) => t.id === id)?.name : undefined;

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!showCompleted && t.status === 'completed') return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
      return true;
    });
  }, [tasks, filterCategory, filterAssignee, showCompleted]);

  const getTasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  // Summary counts (from all tasks, ignoring filters)
  const overdue = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    const d = parseISO(t.dueDate);
    return isPast(d) && !isToday(d);
  }).length;

  const dueToday = tasks.filter((t) => {
    if (t.status === 'completed' || !t.dueDate) return false;
    return isToday(parseISO(t.dueDate));
  }).length;

  // Modal handlers
  function handleSave(data: Omit<Task, 'id' | 'createdAt'>) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setModalOpen(false);
    setEditingTask(undefined);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function handleAddTask(status: TaskStatus) {
    setDefaultStatus(status);
    setEditingTask(undefined);
    setModalOpen(true);
  }

  function handleOpenAdd() {
    setDefaultStatus('pending');
    setEditingTask(undefined);
    setModalOpen(true);
  }

  // DnD handlers
  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    const overId = over.id as string;
    const isCol = COLUMNS.some((c) => c.status === overId);
    if (isCol) {
      setOverColumn(overId as TaskStatus);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) setOverColumn(overTask.status);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const isCol = COLUMNS.some((c) => c.status === overId);
    let targetStatus: TaskStatus;

    if (isCol) {
      targetStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      targetStatus = overTask.status;
    }

    reorderTasks(activeId, isCol ? '' : overId, targetStatus);
  }

  const CATEGORY_OPTIONS: { value: TaskCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'すべてのカテゴリ' },
    { value: 'kurietto', label: 'クリエット事業' },
    { value: 'techice', label: 'テックアイス' },
    { value: 'training', label: '研修' },
    { value: 'other', label: 'その他' },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">タスク管理</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {overdue > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3" />
                  期限超過 {overdue}件
                </span>
              )}
              {dueToday > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  <Clock className="w-3 h-3" />
                  本日期限 {dueToday}件
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shrink-0 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">タスクを追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />絞り込み
          </span>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">すべての担当者</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            完了済みを表示
          </label>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 md:gap-5 p-3 md:p-6 min-h-full w-fit">
            {COLUMNS.map((col) => (
              (!showCompleted && col.status === 'completed') ? null : (
                <DroppableColumn
                  key={col.status}
                  {...col}
                  tasks={getTasksByStatus(col.status)}
                  isDraggingOver={overColumn === col.status}
                  getAssigneeName={getAssigneeName}
                  onEdit={handleEdit}
                  onDelete={deleteTask}
                  onAddTask={handleAddTask}
                />
              )
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCard
                task={activeTask}
                assigneeName={getAssigneeName(activeTask.assigneeId)}
                onEdit={handleEdit}
                onDelete={deleteTask}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask ?? (defaultStatus !== 'pending'
            ? ({ status: defaultStatus } as Task)
            : undefined)}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
}
