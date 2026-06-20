import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--admin-accent)] text-white",
        secondary:
          "border-transparent bg-gray-100 text-gray-600",
        success:
          "border-transparent bg-green-50 text-[var(--admin-success)]",
        destructive:
          "border-transparent bg-red-50 text-[var(--admin-danger)]",
        warning:
          "border-transparent bg-orange-50 text-[var(--admin-warning)]",
        outline: "border-[var(--admin-border)] text-[var(--admin-text)]",
        purple:
          "border-transparent bg-purple-50 text-purple-700",
        blue:
          "border-transparent bg-blue-50 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
