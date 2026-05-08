import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost" | "outline" | "accent";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-accent text-accent-text shadow-[0_10px_24px_rgba(37,192,122,0.22)] hover:brightness-110",
  accent:
    "bg-accent text-accent-text shadow-[0_10px_24px_rgba(37,192,122,0.22)] hover:brightness-110",
  secondary:
    "bg-inset text-text hover:bg-[color-mix(in_srgb,var(--color-inset)_78%,white)]",
  ghost: "bg-transparent text-text-2 hover:bg-inset hover:text-text",
  outline:
    "bg-transparent text-text border border-inset-border hover:bg-inset hover:text-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-[14px]",
  sm: "h-9 px-3 text-[13px]",
  lg: "h-11 px-6 text-[14px]",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
