"use client";

import { useState, useCallback, useEffect } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationDropdown, useNotificationCount } from "./NotificationDropdown";
import { useMobileNav } from "./MobileNavContext";

function formatTodayJa(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = days[now.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
}

export function Header({ className }: { className?: string }) {
  const { toggle: toggleMobileNav } = useMobileNav();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifCount = useNotificationCount();
  const today = formatTodayJa();

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleNotif = useCallback(() => setNotifOpen((v) => !v), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

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
      <GlobalSearch open={searchOpen} onClose={closeSearch} />

      <header
        className={cn(
          "sticky top-0 z-30 h-12",
          "flex items-center justify-between px-3 md:px-4",
          "bg-blue-700",
          "shadow-md",
          className
        )}
      >
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleMobileNav}
            className="block md:hidden w-8 h-8 flex items-center justify-center rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="メニューを開く"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand */}
          <div className="flex items-center gap-0.5 select-none">
            <span className="text-white font-bold text-base md:text-lg tracking-wide">Creatte</span>
            <span className="text-orange-300 font-bold text-base md:text-lg tracking-wide ml-1.5">Office</span>
          </div>
        </div>

        {/* Right: date + search + notif + avatar */}
        <div className="flex items-center gap-1 md:gap-2">
          <span className="hidden md:block text-white/80 text-sm">{today}</span>

          <button
            onClick={openSearch}
            className="w-8 h-8 flex items-center justify-center rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="検索"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={toggleNotif}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors",
                notifOpen && "bg-white/10 text-white"
              )}
              aria-label="通知"
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>
            <NotificationDropdown open={notifOpen} onClose={closeNotif} />
          </div>

          {/* Avatar */}
          <button className="w-8 h-8 rounded-full bg-yellow-400 text-blue-900 font-bold text-sm flex items-center justify-center shadow-sm hover:bg-yellow-300 transition-colors">
            ク
          </button>
        </div>
      </header>
    </>
  );
}

export default Header;
