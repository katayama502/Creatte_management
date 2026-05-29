"use client";

import { cn } from "@/lib/utils";
import { StudentStatus } from "@/types";

// ============================================================
// Status badge for StudentStatus
// ============================================================

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  StudentStatus,
  { label: string; classes: string }
> = {
  trial_pending: {
    label: "体験待ち",
    classes:
      "bg-gray-100 text-gray-700 border border-gray-200",
  },
  trial_completed: {
    label: "体験済み",
    classes:
      "bg-amber-50 text-amber-700 border border-amber-200",
  },
  enrolled: {
    label: "入会手続き中",
    classes:
      "bg-blue-50 text-blue-700 border border-blue-200",
  },
  active: {
    label: "在籍中",
    classes:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  inactive: {
    label: "退会",
    classes:
      "bg-red-50 text-red-600 border border-red-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        config.classes,
        className
      )}
    >
      <span className="sr-only">ステータス: </span>
      {config.label}
    </span>
  );
}

// ============================================================
// Teacher color pill
// ============================================================

interface TeacherColorBadgeProps {
  name: string;
  color: string;
  className?: string;
}

export function TeacherColorBadge({
  name,
  color,
  className,
}: TeacherColorBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white whitespace-nowrap",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

// ============================================================
// Generic badge
// ============================================================

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-brand-100 text-brand-700",
  secondary: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-600",
  outline: "border border-gray-300 text-gray-600 bg-white",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        BADGE_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
