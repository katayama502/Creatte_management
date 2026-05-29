'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, User, Music } from 'lucide-react';
import { useStudentStore } from '@/store/studentStore';
import { useTeacherStore } from '@/store/teacherStore';
import { getStatusLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Student, Teacher } from '@/types';

// ============================================================
// Status badge
// ============================================================

const STATUS_COLORS: Record<string, string> = {
  trial_pending: 'bg-yellow-100 text-yellow-700',
  trial_completed: 'bg-blue-100 text-blue-700',
  enrolled: 'bg-purple-100 text-purple-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
        STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500'
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

// ============================================================
// Props
// ============================================================

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

// ============================================================
// Main component
// ============================================================

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const students = useStudentStore((s) => s.students);
  const teachers = useTeacherStore((s) => s.teachers);

  // Debounce 150ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Filtered results (max 5 each)
  const q = debouncedQuery.trim().toLowerCase();

  const matchedStudents: Student[] = q
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.nameKana.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const matchedTeachers: Teacher[] = q
    ? teachers
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.nameKana.toLowerCase().includes(q) ||
            t.subjects.some((sub) => sub.toLowerCase().includes(q))
        )
        .slice(0, 5)
    : [];

  const hasResults = matchedStudents.length > 0 || matchedTeachers.length > 0;

  const handleStudentClick = useCallback(
    (id: string) => {
      onClose();
      router.push(`/students`);
    },
    [onClose, router]
  );

  const handleTeacherClick = useCallback(
    (id: string) => {
      onClose();
      router.push(`/teachers`);
    },
    [onClose, router]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed left-1/2 top-[10vh] z-50 -translate-x-1/2',
          'w-full max-w-xl',
          'bg-white rounded-2xl shadow-2xl border border-gray-100',
          'overflow-hidden'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="グローバル検索"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="生徒・講師・レッスンを検索..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="クリア"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 text-xs text-gray-400 font-mono">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!q && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              キーワードを入力して検索
            </div>
          )}

          {q && !hasResults && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <X className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="font-medium text-gray-500">見つかりません</p>
              <p className="mt-1 text-xs">別のキーワードで検索してみてください</p>
            </div>
          )}

          {/* Students section */}
          {matchedStudents.length > 0 && (
            <section>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  生徒
                </span>
              </div>
              <ul>
                {matchedStudents.map((student) => {
                  const teacher = teachers.find((t) => t.id === student.teacherId);
                  return (
                    <li key={student.id}>
                      <button
                        onClick={() => handleStudentClick(student.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3',
                          'hover:bg-gray-50 transition-colors text-left',
                          'border-b border-gray-50'
                        )}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {student.name}
                            </span>
                            <StatusBadge status={student.status} />
                          </div>
                          {teacher && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              担当: {teacher.name}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Teachers section */}
          {matchedTeachers.length > 0 && (
            <section>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  講師
                </span>
              </div>
              <ul>
                {matchedTeachers.map((teacher) => (
                  <li key={teacher.id}>
                    <button
                      onClick={() => handleTeacherClick(teacher.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3',
                        'hover:bg-gray-50 transition-colors text-left',
                        'border-b border-gray-50'
                      )}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: teacher.color + '22', color: teacher.color }}
                      >
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate block">
                          {teacher.name}
                        </span>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {teacher.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer hint */}
        {hasResults && (
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-3 text-xs text-gray-400">
            <span>クリックして詳細ページへ</span>
          </div>
        )}
      </div>
    </>
  );
}

export default GlobalSearch;
