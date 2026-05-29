import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * Combines clsx (conditional class logic) with tailwind-merge (deduplication).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Japanese date string from an ISO date string.
 * e.g. "2024-05-01" → "2024年5月1日"
 */
export function formatDateJa(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * Returns a Japanese weekday name for a given date or day index.
 * 0 = 日, 1 = 月, ..., 6 = 土
 */
export function getDayNameJa(day: number): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return days[day] ?? "";
}

/**
 * Returns a human-readable label for a StudentStatus value.
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    trial_pending: "体験待ち",
    trial_completed: "体験済み",
    enrolled: "入会手続き中",
    active: "在籍中",
    inactive: "退会",
  };
  return labels[status] ?? status;
}

/**
 * Returns a human-readable label for a CourseFrequency value.
 */
export function getFrequencyLabel(freq: number): string {
  return `月${freq}回`;
}

/**
 * Generates a simple UUID-like ID (not cryptographically secure, suitable for client-side mock data).
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Formats a time string to a display string.
 * e.g. "14:30" → "14:30"
 */
export function formatTime(time: string): string {
  return time;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
