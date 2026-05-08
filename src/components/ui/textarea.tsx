import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[56px] w-full resize-none rounded-2xl border border-inset-border bg-transparent px-4 py-3 text-[14px] text-text outline-none transition-all placeholder:text-text-4 focus:border-accent/35 focus:bg-[color-mix(in_srgb,var(--color-inset)_90%,white)] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),0_0_0_3px_rgba(37,192,122,0.10)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
