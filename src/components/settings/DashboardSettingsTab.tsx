'use client'

import { useDashboardStore, ExtendedPanelType } from '@/store/dashboardStore'
import { Info } from 'lucide-react'

// ============================================================
// Panel descriptions
// ============================================================

const PANEL_DESCRIPTIONS: Record<ExtendedPanelType, string> = {
  stats: '生徒数・講師数・今月のレッスン数などの集計',
  recent_students: '最近登録した生徒の一覧',
  upcoming_lessons: '直近のレッスン予定',
  teacher_load: '各講師の稼働率・担当生徒数',
  fee_status: '今月の月謝回収状況',
  tasks: '未完了タスクと期限超過アラート',
  sponsor_progress: '協賛企業の目標達成進捗ゲージ',
}

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
      role="switch"
      aria-checked={checked}
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
// Main Component
// ============================================================

export default function DashboardSettingsTab() {
  const { panels, togglePanelVisible } = useDashboardStore()

  // Sort by position
  const sortedPanels = [...panels].sort((a, b) => a.position - b.position)
  const visibleCount = panels.filter((p) => p.visible).length

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ダッシュボード設定</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              表示するパネルをオン／オフで切り替えられます（{visibleCount} / {panels.length} 表示中）
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sortedPanels.map((panel) => {
            const description = PANEL_DESCRIPTIONS[panel.type] ?? ''
            return (
              <div
                key={panel.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  panel.visible
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Toggle */}
                <Toggle
                  checked={panel.visible}
                  onChange={() => togglePanelVisible(panel.id)}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${panel.visible ? 'text-gray-900' : 'text-gray-500'}`}>
                    {panel.title}
                  </p>
                  {description && (
                    <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                  )}
                </div>

                {/* Status badge */}
                <span
                  className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    panel.visible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {panel.visible ? '表示' : '非表示'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Preview note */}
      <div className="flex items-start gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-700">
          変更はダッシュボードに即時反映されます
        </p>
      </div>
    </div>
  )
}
