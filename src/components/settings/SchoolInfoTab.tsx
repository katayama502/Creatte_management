'use client'

import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { SchoolSettings } from '@/types'
import { Save, CheckCircle } from 'lucide-react'

// ============================================================
// Input helpers
// ============================================================

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

// ============================================================
// Component
// ============================================================

export default function SchoolInfoTab() {
  const { school, updateSchool } = useSettingsStore()
  const [form, setForm] = useState<SchoolSettings>(school)
  const [saved, setSaved] = useState(false)

  // Keep local form in sync if store changes externally
  useEffect(() => {
    setForm(school)
  }, [school])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  function handleSave() {
    updateSchool(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="space-y-4">
          <Field label="教室名">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="クリエットプログラミング教室"
            />
          </Field>

          <Field label="サブタイトル">
            <input
              type="text"
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              className={inputClass}
              placeholder="プログラミング教室"
            />
          </Field>

          <Field label="住所">
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="東京都渋谷区..."
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="電話番号">
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="03-0000-0000"
              />
            </Field>

            <Field label="メールアドレス">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="info@example.com"
              />
            </Field>
          </div>

          <Field label="Webサイト">
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://example.com"
            />
          </Field>
        </div>
      </div>

      {/* Fee Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">費用設定</h2>
        <div className="space-y-4">
          <Field label="体験会費">
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="trialFee"
                value={form.trialFee}
                onChange={handleChange}
                className={inputClass}
                min={0}
                placeholder="0"
              />
              <span className="text-sm text-gray-500 shrink-0">円</span>
              {form.trialFee === 0 && (
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  無料
                </span>
              )}
            </div>
          </Field>

          <Field label="入会金">
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="enrollmentFee"
                value={form.enrollmentFee}
                onChange={handleChange}
                className={inputClass}
                min={0}
                placeholder="5000"
              />
              <span className="text-sm text-gray-500 shrink-0">円</span>
            </div>
          </Field>

          <Field label="教材費（初回）">
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="materialsFee"
                value={form.materialsFee}
                onChange={handleChange}
                className={inputClass}
                min={0}
                placeholder="3000"
              />
              <span className="text-sm text-gray-500 shrink-0">円</span>
            </div>
          </Field>
        </div>
      </div>

      {/* Notes Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">備考・規約</h2>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={6}
          className={inputClass}
          placeholder="利用規約や注意事項などを入力してください..."
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          保存する
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            保存しました
          </div>
        )}
      </div>
    </div>
  )
}
