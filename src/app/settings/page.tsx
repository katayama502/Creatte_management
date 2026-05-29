'use client'

import { useState } from 'react'
import { Settings, BookOpen, DollarSign, LayoutDashboard, School } from 'lucide-react'
import SchoolInfoTab from '@/components/settings/SchoolInfoTab'
import CourseSettingsTab from '@/components/settings/CourseSettingsTab'
import FeeSettingsTab from '@/components/settings/FeeSettingsTab'
import DashboardSettingsTab from '@/components/settings/DashboardSettingsTab'

// ============================================================
// Tab config
// ============================================================

type TabId = 'school' | 'courses' | 'fees' | 'dashboard'

interface Tab {
  id: TabId
  label: string
  icon: React.ElementType
}

const TABS: Tab[] = [
  { id: 'school', label: 'スクール情報', icon: School },
  { id: 'courses', label: 'コース管理', icon: BookOpen },
  { id: 'fees', label: '料金・割引設定', icon: DollarSign },
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
]

// ============================================================
// Page
// ============================================================

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('school')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-100">
            <Settings className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">設定</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              スクールの基本情報・コース・料金を管理します
            </p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-2 py-3">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6">
        {activeTab === 'school' && <SchoolInfoTab />}
        {activeTab === 'courses' && <CourseSettingsTab />}
        {activeTab === 'fees' && <FeeSettingsTab />}
        {activeTab === 'dashboard' && <DashboardSettingsTab />}
      </div>
    </div>
  )
}
