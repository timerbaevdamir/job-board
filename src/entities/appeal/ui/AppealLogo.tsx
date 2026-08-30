import type { Appeal } from "../model/types"
import { cn } from "@/shared/lib/cn"

/** Company mark for a thread: PNG when present, otherwise the letter tile. */
export function AppealLogo({
  appeal,
  highlight,
}: {
  appeal: Pick<Appeal, "companyInitial" | "logoBg" | "logoColor" | "logoUrl">
  /** Selected row in the wide list — letter tiles invert; PNGs stay as-is. */
  highlight?: boolean
}) {
  const invertLetter = Boolean(highlight && !appeal.logoUrl)

  return (
    <span
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-base font-semibold",
        invertLetter &&
          "bg-chat-active-foreground/20 text-chat-active-foreground",
      )}
      style={
        invertLetter
          ? undefined
          : {
              backgroundColor: appeal.logoBg,
              color: appeal.logoColor ?? "#ffffff",
            }
      }
    >
      {appeal.logoUrl ? (
        <img src={appeal.logoUrl} alt="" className="size-full object-cover" />
      ) : (
        appeal.companyInitial
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
      />
    </span>
  )
}
