"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, User, ChevronDown, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationDropdown, useNotificationCount } from "./NotificationDropdown";
import { useMobileNav } from "./MobileNavContext";

// ============================================================
// Route → page title mapping
// ============================================================

const PAGE_TITLES: Record<string, string> = {
  "/": "ダッシュボード",
  "/students": "生徒管理",
  "/enrollment": "入会申し込み",
  "/schedule": "スケジュール",
  "/teachers": "講師管理",
  "/settings": "設定",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Try prefix match (e.g., /students/[id])
  const prefix = Object.keys(PAGE_TITLES)
    .filter((k) => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? PAGE_TITLES[prefix] : "クリエット";
}

// ============================================================
// Date formatting
// ============================================================

function formatTodayJa(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = days[now.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

// ============================================================
// Header component
// ============================================================

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const today = formatTodayJa();

  const { toggle: toggleMobileNav } = useMobileNav();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifCount = useNotificationCount();

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleNotif = useCallback(() => setNotifOpen((v) => !v), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

  // Open search on "/" keypress (when not focused in an input/textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Global Search overlay */}
      <GlobalSearch open={searchOpen} onClose={closeSearch} />

      <header
        className={cn(
          "sticky top-0 z-30 h-16",
          "flex items-center justify-between px-4 md:px-6",
          "bg-white/90 backdrop-blur-sm",
          "border-b border-gray-100",
          "shadow-sm",
          className
        )}
      >
        {/* Left: Hamburger (mobile) + Page title */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={toggleMobileNav}
            className={cn(
              "block md:hidden",
              "flex items-center justify-center",
              "w-9 h-9 rounded-lg",
              "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
              "transition-colors duration-150"
            )}
            aria-label="メニューを開く"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm md:text-lg font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>
          <span className="hidden sm:block text-sm text-gray-400">{today}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search shortcut hint + button */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <span className="text-xs text-gray-400 select-none">/ で検索</span>
          </div>
          <button
            onClick={openSearch}
            className={cn(
              "relative flex items-center justify-center",
              "w-9 h-9 rounded-lg",
              "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
              "transition-colors duration-150"
            )}
            aria-label="検索を開く"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Notification bell with dropdown */}
          <div className="relative">
            <button
              onClick={toggleNotif}
              className={cn(
                "relative flex items-center justify-center",
                "w-9 h-9 rounded-lg",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                "transition-colors duration-150",
                notifOpen && "bg-gray-100 text-gray-700"
              )}
              aria-label="通知"
              aria-expanded={notifOpen}
            >
              <Bell className="w-5 h-5" />
              {/* Count badge */}
              {notifCount > 0 && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5",
                    "flex items-center justify-center",
                    "min-w-[18px] h-[18px] px-1 rounded-full",
                    "bg-red-500 text-white text-[10px] font-bold leading-none"
                  )}
                >
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            <NotificationDropdown open={notifOpen} onClose={closeNotif} />
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* User menu */}
          <button
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg",
              "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
              "transition-colors duration-150"
            )}
            aria-label="ユーザーメニュー"
          >
            {/* Avatar */}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-semibold shrink-0">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden md:block text-sm font-medium">管理者</span>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>
    </>
  );
}

export default Header;
