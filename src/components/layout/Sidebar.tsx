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
  Code2,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Navigation config
// ============================================================

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
  { label: "講師管理", href: "/teachers", icon: GraduationCap },
];

// ============================================================
// Sidebar component
// ============================================================

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0",
        "bg-brand-950 text-white",
        "transition-all duration-300 ease-in-out",
        "border-r border-white/5",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          "flex items-center h-16 px-4 shrink-0",
          "border-b border-white/10",
          collapsed ? "justify-center" : "justify-start gap-3"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500 shrink-0">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white tracking-wide leading-none">
              クリエット
            </p>
            <p className="text-xs text-brand-300 mt-0.5 leading-none">
              プログラミング教室
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hidden">
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm font-medium",
                "transition-all duration-150",
                "group",
                isActive
                  ? "bg-brand-500/30 text-white"
                  : "text-brand-200 hover:bg-white/8 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-colors",
                  "w-5 h-5",
                  isActive ? "text-brand-300" : "text-brand-400 group-hover:text-brand-300"
                )}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1 shrink-0">
        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-sm font-medium text-brand-200",
            "hover:bg-white/8 hover:text-white transition-all duration-150",
            "group",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "設定" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0 text-brand-400 group-hover:text-brand-300 transition-colors" />
          {!collapsed && <span>設定</span>}
        </Link>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
            "text-sm font-medium text-brand-300",
            "hover:bg-white/8 hover:text-white transition-all duration-150",
            collapsed && "justify-center px-2"
          )}
          aria-label={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>折りたたむ</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
