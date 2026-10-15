import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3 text-center", className)}
      {...props}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ember),transparent_86%)] text-[var(--ember)] ring-1 ring-[color-mix(in_oklch,var(--ember),transparent_62%)] shadow-[0_0_34px_-6px_color-mix(in_oklch,var(--ember),transparent_45%)]">
        <Flame className="size-6" strokeWidth={1.5} />
      </span>

      <span className="font-heading text-2xl font-semibold tracking-[0.02em]">
        Dragon Roll
      </span>
    </div>
  );
}
