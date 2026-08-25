import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "destructive" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variant === "default" && "bg-indigo-100 text-indigo-700",
      variant === "destructive" && "bg-red-100 text-red-700",
      variant === "outline" &&
        "border border-slate-200 text-slate-600 bg-white",
      className,
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
