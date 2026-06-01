import { create } from 'zustand';
import { Task, TaskStatus } from '@/types';

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  reorderTasks: (activeId: string, overId: string, newStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: 'temp-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [newTask, ...state.tasks] }));
    import('@/lib/firestore/tasks').then(({ createTask }) => {
      createTask(task).then((created) => {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === newTask.id ? created : t),
        }));
      });
    });
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));
    import('@/lib/firestore/tasks').then(({ updateTask }) => updateTask(id, updates));
  },

  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    import('@/lib/firestore/tasks').then(({ deleteTask }) => deleteTask(id));
  },

  completeTask: (id) => {
    const completedAt = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: 'completed', completedAt } : t
      ),
    }));
    import('@/lib/firestore/tasks').then(({ updateTask }) =>
      updateTask(id, { status: 'completed', completedAt })
    );
  },

  setTaskStatus: (id, status) => {
    const updates: Partial<Task> = { status };
    if (status === 'completed') updates.completedAt = new Date().toISOString();
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));
    import('@/lib/firestore/tasks').then(({ updateTask }) => updateTask(id, updates));
  },

  reorderTasks: (activeId, overId, newStatus) => {
    set((state) => {
      const tasks = [...state.tasks];
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return state;

      const activeTask = tasks[activeIndex];
      const updates: Partial<Task> = { status: newStatus };
      if (newStatus === 'completed' && activeTask.status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }

      // Remove active task from its position
      tasks.splice(activeIndex, 1);

      // Find the index to insert at
      const overIndex = tasks.findIndex((t) => t.id === overId);
      const updatedActive = { ...activeTask, ...updates };

      if (overIndex === -1) {
        // overId is a column id or not found — append to end of that status group
        tasks.push(updatedActive);
      } else {
        tasks.splice(overIndex, 0, updatedActive);
      }

      return { tasks };
    });

    // Persist status change
    const task = get().tasks.find((t) => t.id === activeId);
    const persistUpdates: Partial<Task> = { status: newStatus };
    if (newStatus === 'completed' && task && task.status !== 'completed') {
      persistUpdates.completedAt = new Date().toISOString();
    }
    import('@/lib/firestore/tasks').then(({ updateTask }) => updateTask(activeId, persistUpdates));
  },
}));
