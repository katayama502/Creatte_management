"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-lg",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-600 text-white shadow-sm",
          "hover:bg-brand-700 active:bg-brand-800",
        ],
        secondary: [
          "bg-brand-50 text-brand-700 border border-brand-200",
          "hover:bg-brand-100 active:bg-brand-200",
        ],
        outline: [
          "border border-gray-200 bg-white text-gray-700 shadow-sm",
          "hover:bg-gray-50 active:bg-gray-100",
        ],
        danger: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 active:bg-red-800",
        ],
        ghost: [
          "text-gray-600 bg-transparent",
          "hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
        ],
        link: [
          "text-brand-600 underline-offset-4 hover:underline p-0 h-auto",
        ],
      },
      size: {
        sm: "text-xs px-3 py-1.5 h-8",
        md: "text-sm px-4 py-2 h-9",
        lg: "text-base px-5 py-2.5 h-11",
        icon: "p-2 h-9 w-9",
        "icon-sm": "p-1.5 h-7 w-7",
        "icon-lg": "p-2.5 h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
