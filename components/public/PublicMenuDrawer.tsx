"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SHEET_SPRING = { type: "spring" as const, damping: 28, stiffness: 320 };

interface PublicMenuDrawerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  zIndexClass?: string;
  maxHeightClass?: string;
  sheetClassName?: string;
  dragToDismiss?: boolean;
  "aria-labelledby"?: string;
}

export function PublicMenuDrawerSheet({
  open,
  onOpenChange,
  children,
  zIndexClass = "z-[58]",
  maxHeightClass = "max-h-[85dvh]",
  sheetClassName,
  dragToDismiss = true,
  "aria-labelledby": ariaLabelledBy,
}: PublicMenuDrawerSheetProps) {
  const close = () => onOpenChange(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 bg-black/40", zIndexClass)}
          onClick={close}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_SPRING}
            drag={dragToDismiss ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) close();
            }}
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto w-full max-w-web overflow-y-auto rounded-t-sheet bg-card shadow-card",
              maxHeightClass,
              sheetClassName
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PublicSheetHeaderProps {
  title?: string;
  titleId?: string;
  children?: ReactNode;
}

export function PublicSheetHeader({
  title,
  titleId,
  children,
}: PublicSheetHeaderProps) {
  return (
    <div className="px-4 pb-4 pt-2 text-start">
      {children ?? (
        <h2 id={titleId} className="text-base font-bold text-foreground">
          {title}
        </h2>
      )}
    </div>
  );
}
