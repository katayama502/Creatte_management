'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { Discount, CourseFrequency } from '@/types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

// ============================================================
// Helpers
// ============================================================

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

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

function formatYen(amount: number) {
  return `¥${amount.toLocaleString()}`
}

// ============================================================
// Fee Table Section
// ============================================================

const FREQ_LABELS: Record<CourseFrequency, string> = {
  1: '月1回 / 週1回ペース',
  2: '月2回 / 週1〜2回ペース',
  3: '月3回 / 週1〜2回ペース',
  4: '月4回 / 週1回ペース（毎週）',
}

function FeeTableSection() {
  const { feeRules, school, updateFeeRule } = useSettingsStore()
  const [localAmounts, setLocalAmounts] = useState<Record<number, string>>(
    Object.fromEntries(feeRules.map((r) => [r.frequency, String(r.amount)]))
  )

  function handleChange(frequency: CourseFrequency, value: string) {
    setLocalAmounts((prev) => ({ ...prev, [frequency]: value }))
  }

  function handleBlur(frequency: CourseFrequency) {
    const amount = parseInt(localAmounts[frequency] ?? '0', 10)
    if (!isNaN(amount) && amount >= 0) {
      updateFeeRule(frequency, amount)
    }
  }

  const FREQUENCIES: CourseFrequency[] = [1, 2, 3, 4]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">月謝テーブル</h2>
      <div className="space-y-3">
        {FREQUENCIES.map((freq) => (
          <div
            key={freq}
            className={`flex items-center justify-between gap-4 p-3 rounded-lg ${
              freq === 2 ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium text-gray-700 truncate">
                {FREQ_LABELS[freq]}
              </span>
              {freq === 2 && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                  おすすめ
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                value={localAmounts[freq] ?? ''}
                onChange={(e) => handleChange(freq, e.target.value)}
                onBlur={() => handleBlur(freq)}
                className="w-28 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={0}
              />
              <span className="text-sm text-gray-500 w-10">円/月</span>
            </div>
          </div>
        ))}
      </div>

      {/* Read-only fees from school settings */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-3">
          以下はスクール情報タブで設定した費用です（参照のみ）
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600">入会金</span>
            <span className="text-sm font-medium text-gray-900">
              {formatYen(school.enrollmentFee)}
            </span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-600">教材費（初回）</span>
            <span className="text-sm font-medium text-gray-900">
              {formatYen(school.materialsFee)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Discount Form
// ============================================================

interface DiscountFormData {
  name: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  stackable: boolean
  active: boolean
}

const EMPTY_DISCOUNT: DiscountFormData = {
  name: '',
  type: 'fixed',
  value: 0,
  description: '',
  stackable: true,
  active: true,
}

function DiscountForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: DiscountFormData
  onSubmit: (data: DiscountFormData) => void
  onCancel: () => void
  submitLabel: string
}) {
  const [form, setForm] = useState<DiscountFormData>(initial ?? EMPTY_DISCOUNT)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target
    const name = target.name
    const value =
      target.type === 'checkbox'
        ? (target as HTMLInputElement).checked
        : target.type === 'number'
        ? Number(target.value)
        : target.value
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">割引名 *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            placeholder="例: 兄弟割引"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">種類</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="fixed">定額割引（円）</option>
            <option value="percentage">割引率（%）</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            値{form.type === 'percentage' ? '（%）' : '（円）'}
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              className={inputClass}
              min={0}
              max={form.type === 'percentage' ? 100 : undefined}
            />
            <span className="text-sm text-gray-500 shrink-0">
              {form.type === 'percentage' ? '%' : '円'}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">説明</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="割引の適用条件など"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="stackable"
            checked={form.stackable}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600"
          />
          他の割引と併用可能
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600"
          />
          有効にする
        </label>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {submitLabel}
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
// Discount Card
// ============================================================

function DiscountCard({ discount }: { discount: Discount }) {
  const { toggleDiscountActive, deleteDiscount, updateDiscount } = useSettingsStore()
  const [editing, setEditing] = useState(false)

  function handleDelete() {
    if (window.confirm(`「${discount.name}」を削除しますか？`)) {
      deleteDiscount(discount.id)
    }
  }

  function handleEditSave(data: DiscountFormData) {
    updateDiscount(discount.id, data)
    setEditing(false)
  }

  if (editing) {
    return (
      <DiscountForm
        initial={{
          name: discount.name,
          type: discount.type,
          value: discount.value,
          description: discount.description,
          stackable: discount.stackable,
          active: discount.active,
        }}
        onSubmit={handleEditSave}
        onCancel={() => setEditing(false)}
        submitLabel="更新する"
      />
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="mt-0.5">
        <Toggle
          checked={discount.active}
          onChange={() => toggleDiscountActive(discount.id)}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">{discount.name}</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              discount.type === 'percentage'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {discount.type === 'percentage' ? '割引率' : '定額割引'}
          </span>
          <span className="text-sm font-medium text-indigo-600">
            {discount.type === 'percentage'
              ? `${discount.value}%`
              : `¥${discount.value.toLocaleString()}`}
          </span>
          {discount.stackable && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">
              併用可
            </span>
          )}
        </div>
        {discount.description && (
          <p className="text-xs text-gray-500 mt-1">{discount.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
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
  )
}

// ============================================================
// Discount Section
// ============================================================

function DiscountSection() {
  const { discounts, addDiscount } = useSettingsStore()
  const [showForm, setShowForm] = useState(false)

  function handleAdd(data: DiscountFormData) {
    addDiscount(data)
    setShowForm(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">割引設定</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            割引を追加
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <DiscountForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
            submitLabel="追加する"
          />
        </div>
      )}

      {discounts.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          割引が登録されていません
        </p>
      ) : (
        <div className="space-y-3">
          {discounts.map((d) => (
            <DiscountCard key={d.id} discount={d} />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Simulator Section
// ============================================================

function SimulatorSection() {
  const { feeRules, discounts, getFeeAmount, calculateDiscountedFee } = useSettingsStore()
  const activeDiscounts = discounts.filter((d) => d.active)

  const [selectedFreq, setSelectedFreq] = useState<CourseFrequency>(2)
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([])

  const baseAmount = getFeeAmount(selectedFreq)
  const finalAmount = calculateDiscountedFee(baseAmount, selectedDiscountIds)
  const saved = baseAmount - finalAmount

  function toggleDiscount(id: string) {
    setSelectedDiscountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const FREQUENCIES: CourseFrequency[] = [1, 2, 3, 4]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">割引シミュレーター</h2>
      <p className="text-sm text-gray-500 mb-5">
        受講回数と割引の組み合わせで月謝を試算できます
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">受講回数</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((freq) => {
                const rule = feeRules.find((r) => r.frequency === freq)
                return (
                  <button
                    key={freq}
                    onClick={() => setSelectedFreq(freq)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                      selectedFreq === freq
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div>月{freq}回</div>
                    <div className={`text-xs ${selectedFreq === freq ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {formatYen(rule?.amount ?? 0)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {activeDiscounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">適用する割引</label>
              <div className="space-y-2">
                {activeDiscounts.map((d) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDiscountIds.includes(d.id)}
                      onChange={() => toggleDiscount(d.id)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">{d.name}</span>
                    <span className="text-xs text-gray-500">
                      ({d.type === 'percentage' ? `${d.value}%` : `¥${d.value.toLocaleString()}`})
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: result */}
        <div className="bg-gray-50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">計算結果</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>月{selectedFreq}回 基本料金</span>
                <span className="font-medium">{formatYen(baseAmount)}</span>
              </div>

              {selectedDiscountIds.map((id) => {
                const d = discounts.find((x) => x.id === id)
                if (!d) return null
                return (
                  <div key={id} className="flex justify-between text-sm text-green-700">
                    <span>{d.name}</span>
                    <span className="font-medium">
                      -{d.type === 'percentage' ? `${d.value}%` : formatYen(d.value)}
                    </span>
                  </div>
                )
              })}

              {selectedDiscountIds.length > 0 && (
                <div className="border-t border-gray-200 pt-2 flex justify-between text-xs text-gray-500">
                  <span>割引合計</span>
                  <span className="text-green-600">-{formatYen(saved)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-gray-700">月謝合計</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{formatYen(finalAmount)}</span>
                <span className="text-xs text-gray-500 ml-1">/月</span>
              </div>
            </div>
            {saved > 0 && (
              <p className="text-xs text-green-600 text-right mt-1">
                {formatYen(saved)} お得
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Component
// ============================================================

export default function FeeSettingsTab() {
  return (
    <div className="max-w-3xl space-y-6">
      <FeeTableSection />
      <DiscountSection />
      <SimulatorSection />
    </div>
  )
}
