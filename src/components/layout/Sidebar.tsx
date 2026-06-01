"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Building2,
  Building,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileNav } from "./MobileNavContext";
import { useTeacherStore } from "@/store/teacherStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { label: "タスク管理", href: "/tasks", icon: CheckSquare },
  { label: "生徒管理", href: "/students", icon: Users },
  { label: "スケジュール", href: "/schedule", icon: Calendar },
  { label: "入会申し込み", href: "/enrollment", icon: FileText },
  { label: "協賛企業管理", href: "/sponsors", icon: Building2 },
  { label: "施設管理", href: "/facilities", icon: Building },
  { label: "講師管理", href: "/teachers", icon: GraduationCap },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen, close } = useMobileNav();
  const teachers = useTeacherStore((s) => s.teachers);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen shrink-0",
          "bg-white border-r border-gray-200",
          "transition-all duration-300 ease-in-out",
          // Mobile: fixed overlay
          "fixed inset-y-0 left-0 z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static in flow, always visible
          "md:static md:translate-x-0",
          collapsed ? "w-14" : "w-56"
        )}
      >
        {/* Top bar — mirrors header height */}
        <div
          className={cn(
            "flex items-center h-12 px-3 shrink-0 bg-blue-700",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <span className="text-white text-sm font-semibold tracking-wide select-none">
              メニュー
            </span>
          )}
          {/* Mobile close button */}
          <button
            onClick={close}
            className="md:hidden flex items-center justify-center w-7 h-7 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="サイドバーを閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 mx-1 rounded",
                  "text-sm font-medium transition-colors duration-100",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "justify-center px-2 mx-1"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Members section */}
        {!collapsed && teachers.length > 0 && (
          <div className="px-3 py-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              講師
            </p>
            <div className="space-y-0.5">
              {teachers.slice(0, 6).map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-2 px-1 py-1 rounded text-sm text-gray-600"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: teacher.color }}
                  />
                  <span className="truncate text-xs">{teacher.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom: Settings + Collapse */}
        <div className="px-1 py-2 border-t border-gray-200 space-y-0.5 shrink-0">
          <Link
            href="/settings"
            onClick={close}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 mx-0 rounded",
              "text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              pathname.startsWith("/settings") && "bg-blue-50 text-blue-700",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "設定" : undefined}
          >
            <Settings className={cn("w-4 h-4 shrink-0", pathname.startsWith("/settings") ? "text-blue-600" : "text-gray-400")} />
            {!collapsed && <span>設定</span>}
          </Link>

          {/* Collapse button — desktop only */}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "hidden md:flex w-full items-center gap-2.5 px-3 py-2 rounded",
              "text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors",
              collapsed && "justify-center px-2"
            )}
            aria-label={collapsed ? "サイドバーを展開" : "折りたたむ"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>折りたたむ</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
