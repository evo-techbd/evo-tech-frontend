import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/all_utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-px text-[0.625rem] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        customdefault: "border border-stone-300 bg-stone-500 text-white",
        success: "border border-emerald-300 bg-emerald-100 text-emerald-700",
        warning: "border border-orange-300 bg-orange-100/80 text-orange-500",
        failed: "border border-rose-300 bg-rose-100/80 text-rose-700",
        inprogress: "border border-sky-300 bg-sky-100 text-sky-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
