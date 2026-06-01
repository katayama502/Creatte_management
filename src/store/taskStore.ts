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
}

export const useTaskStore = create<TaskState>((set) => ({
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
}));
