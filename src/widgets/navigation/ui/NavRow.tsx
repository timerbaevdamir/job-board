import type { NavItem } from "@/shared/config/navigation"
import { Counter } from "@/shared/ui/Counter"
import { cn } from "@/shared/lib/cn"

/**
 * How a destination is presented. The three share one component because they
 * are the same control at different sizes — letting them drift into separate
 * files is how an active state ends up marked one way in the rail and another
 * in the tab bar.
 *
 * - `full` — icon, label and count in a row (desktop sidebar, tablet panel)
 * - `rail` — icon only, count overlaid on it (tablet rail, appeals rail)
 * - `tab`  — icon above a small label (mobile bottom bar)
 */
export type NavVariant = "full" | "rail" | "tab"

export function NavRow({
  item,
  active,
  variant,
  onSelect,
}: {
  item: NavItem
  active: boolean
  variant: NavVariant
  onSelect: (id: string) => void
}) {
  const Icon = item.icon
  const accent = item.count !== undefined && item.countStyle === "accent"
  const muted = item.count !== undefined && item.countStyle === "muted"
  // Only the roomy variant has space for a count beside the label; the other
  // two hang it off the icon.
  const overlaid = variant !== "full"

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      title={variant === "rail" ? item.label : undefined}
      className={cn(
        "group flex items-center text-left text-foreground transition-colors",
        variant === "full" && "w-full gap-3 rounded-xl px-3 py-2.5",
        variant === "rail" && "justify-center gap-3 rounded-xl px-3 py-2.5",
        // Tab: a column, and every tab takes an equal share of the bar.
        //
        // One explicit height, and it is the only thing that sets the bar's.
        // It used to be a sum — the bar's own top and bottom padding, plus this
        // row's, plus the icon pill's — four numbers in two files, none of them
        // the height. Nobody could change it without measuring first, and it
        // had quietly grown to 79px against the 56 a thumb expects.
        variant === "tab" &&
          "h-14 min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-xl",
        // The active destination is marked by a fill, never by dimming the
        // others — same language in all three variants.
        variant !== "tab" && (active ? "bg-chip" : "hover:bg-chip/60"),
      )}
    >
      <span
        className={cn(
          "relative shrink-0",
          // In the bar the fill wraps just the icon, so the label underneath
          // stays legible instead of sitting inside a pill.
          variant === "tab" &&
            cn(
              "flex h-7 items-center justify-center rounded-full px-4 transition-colors",
              active ? "bg-chip" : "group-hover:bg-chip/60",
            ),
        )}
      >
        <Icon className="size-6 text-foreground" />
        {overlaid && accent && (
          <Counter
            value={item.count}
            size="sm"
            ring
            className="absolute -right-1.5 -top-1.5"
          />
        )}
        {overlaid && item.dot && (
          <Counter ring className="absolute -right-0.5 -top-0.5" />
        )}
      </span>

      {variant === "full" && (
        <>
          <span
            className={cn(
              "flex-1 text-base leading-[22px]",
              active ? "font-semibold" : "font-normal",
            )}
          >
            {item.label}
          </span>
          {/* 20px pill against a 22px text line: reads as a marker next to the
              label, not as a second control competing with it. */}
          {accent && <Counter value={item.count} />}
          {muted && (
            <span className="text-base leading-[22px] text-muted">
              {item.count}
            </span>
          )}
          {item.dot && <Counter size="sm" />}
        </>
      )}

      {variant === "tab" && (
        <span
          className={cn(
            "max-w-full truncate text-[11px] leading-4",
            active ? "font-semibold" : "font-normal",
          )}
        >
          {item.label}
        </span>
      )}
    </button>
  )
}
