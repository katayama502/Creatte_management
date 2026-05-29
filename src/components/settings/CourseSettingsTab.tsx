'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { Course } from '@/types'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'

// ============================================================
// Constants
// ============================================================

const PRESET_COLORS = [
  '#f97316', // orange
  '#6366f1', // indigo
  '#10b981', // green
  '#ef4444', // red
  '#f59e0b', // amber
  '#8b5cf6', // purple
]

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

// ============================================================
// Toggle Switch
// ============================================================

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      }`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

// ============================================================
// Color Picker
// ============================================================

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          style={{ backgroundColor: color }}
          title={color}
        >
          {value === color && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}

// ============================================================
// Add Course Form
// ============================================================

interface CourseFormData {
  name: string
  description: string
  color: string
  targetAge: string
  active: boolean
}

const EMPTY_FORM: CourseFormData = {
  name: '',
  description: '',
  color: '#6366f1',
  targetAge: '',
  active: true,
}

function AddCourseForm({ onSubmit, onCancel }: {
  onSubmit: (data: CourseFormData) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<CourseFormData>(EMPTY_FORM)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-gray-900 mb-4">新規コース追加</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">コース名 *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="例: Scratchコース"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">説明</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="コースの概要を入力してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">カラー</label>
          <ColorPicker value={form.color} onChange={(color) => setForm((prev) => ({ ...prev, color }))} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">対象年齢</label>
          <input
            type="text"
            name="targetAge"
            value={form.targetAge}
            onChange={handleChange}
            className={inputClass}
            placeholder="例: 小学1年〜6年"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="add-active"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="add-active" className="text-sm text-gray-700">
            コースを有効にする
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          追加する
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}

// ============================================================
// Course Card
// ============================================================

function CourseCard({ course }: { course: Course }) {
  const { updateCourse, deleteCourse, toggleCourseActive } = useSettingsStore()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Omit<Course, 'id'>>({
    name: course.name,
    description: course.description,
    color: course.color,
    targetAge: course.targetAge,
    active: course.active,
  })

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setEditForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleEditSave() {
    updateCourse(course.id, editForm)
    setEditing(false)
  }

  function handleDelete() {
    if (window.confirm(`「${course.name}」を削除しますか？この操作は元に戻せません。`)) {
      deleteCourse(course.id)
    }
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">コースを編集</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">コース名</label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
            <input
              type="text"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">カラー</label>
            <ColorPicker
              value={editForm.color}
              onChange={(color) => setEditForm((prev) => ({ ...prev, color }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">対象年齢</label>
            <input
              type="text"
              name="targetAge"
              value={editForm.targetAge}
              onChange={handleEditChange}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleEditSave}
            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shrink-0"
            style={{ backgroundColor: course.color }}
          />
          <div>
            <h3 className="text-base font-semibold text-gray-900">{course.name}</h3>
            {course.targetAge && (
              <p className="text-xs text-gray-500 mt-0.5">{course.targetAge}</p>
            )}
          </div>
        </div>
        <Toggle
          checked={course.active}
          onChange={() => toggleCourseActive(course.id)}
        />
      </div>

      {course.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{course.description}</p>
      )}

      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            course.active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {course.active ? '有効' : '無効'}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="編集"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function CourseSettingsTab() {
  const { courses } = useSettingsStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const { addCourse } = useSettingsStore()

  function handleAdd(data: CourseFormData) {
    addCourse(data)
    setShowAddForm(false)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">コース管理</h2>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} コース登録済み</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            コースを追加
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddCourseForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Course grid */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500 text-sm">コースが登録されていません</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-indigo-600 text-sm font-medium hover:underline"
          >
            最初のコースを追加する
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
