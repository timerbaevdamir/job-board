import { VerifiedIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"

/**
 * Non-interactive indicator that replaces the "Откликнуться" button once the
 * user has applied. Heights mirror {@link Button} (md = 44, lg = 52) so the
 * action row keeps its rhythm.
 */
export function AppliedBadge({ size = "md" }: { size?: "md" | "lg" }) {
  const s =
    size === "lg"
      ? { h: "h-13 px-6 text-lg leading-[26px] gap-2.5", icon: "size-6" }
      : { h: "h-11 px-5 text-base leading-[22px] gap-2", icon: "size-5" }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl bg-success-soft font-medium text-success",
        s.h,
      )}
    >
      <VerifiedIcon className={s.icon} strokeWidth={1.75} />
      Вы откликнулись
    </span>
  )
}
