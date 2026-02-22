'use client';

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export function Dropdown({ className, icon, options, ...props }: DropdownProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {icon && (
        <span className="absolute left-3 pointer-events-none text-muted-foreground">
          {icon}
        </span>
      )}
      <select
        className={cn(
          "appearance-none h-10 pr-9 text-sm text-foreground bg-(--bg-elevated) border border-(--border) rounded-md cursor-pointer",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          icon ? "pl-9" : "pl-3"
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 pointer-events-none text-muted-foreground"
      />
    </div>
  );
}
