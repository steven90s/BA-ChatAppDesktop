import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-inset-border bg-inset/80 px-4 text-[14px] text-text shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] outline-none transition-all placeholder:text-text-4 focus:border-accent/35 focus:bg-[color-mix(in_srgb,var(--color-inset)_88%,white)] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),0_0_0_3px_rgba(37,192,122,0.10)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
