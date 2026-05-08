import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-accent text-accent-text",
  secondary: "bg-inset text-text-2",
  outline: "border border-inset-border text-text-2 bg-transparent",
  success:
    "border border-[color-mix(in_srgb,var(--color-green)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-green)_18%,transparent)] text-green",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
