'use client';

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "bottom";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
}: DrawerProps) {
  const isRight = side === "right";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-90 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={isRight ? { x: "100%" } : { y: "100%" }}
            animate={isRight ? { x: 0 } : { y: 0 }}
            exit={isRight ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-91 bg-(--bg-surface) border-border overflow-y-auto",
              isRight
                ? "top-0 right-0 h-full w-full max-w-md border-l"
                : "bottom-0 left-0 right-0 max-h-[85vh] rounded-t-lg border-t",
              className
            )}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-(--bg-surface) border-b border-border">
              {title && (
                <h2 className="font-serif text-xl font-semibold">{title}</h2>
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="ghost-button p-2 rounded-md text-muted-foreground hover:text-foreground cursor-pointer ml-auto"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
