'use client';

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-all duration-180 ease-out cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:border-[rgba(255,255,255,0.14)]",
        active:
          "bg-primary text-primary-foreground border border-primary",
        muted:
          "bg-surface-2 text-muted-foreground border border-transparent",
      },
      size: {
        default: "px-3 py-1.5",
        sm: "px-2.5 py-1 text-[11px]",
        lg: "px-4 py-2 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

export function Chip({ className, variant, size, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(chipVariants({ variant, size, className }))}
      {...props}
    />
  );
}
