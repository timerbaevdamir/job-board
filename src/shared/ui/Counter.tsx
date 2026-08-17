import { cn } from "@/shared/lib/cn"

type CounterTone = "danger" | "info"
type CounterSize = "sm" | "md"

const TONE: Record<CounterTone, string> = {
  danger: "bg-danger",
  info: "bg-info",
}

/** Bare dot: 6px inline next to a label, 8px when it sits on top of an icon. */
const DOT: Record<CounterSize, string> = {
  sm: "size-1.5",
  md: "size-2",
}

/**
 * Numeric pill. Horizontal padding is deliberately tighter than it looks like it
 * should be: a single digit has to stay inside `min-w`, or the pill renders
 * wider than it is tall and stops reading as a circle. Two digits and up push
 * past `min-w` and stretch it — which is the only time stretching is wanted.
 */
const COUNT: Record<CounterSize, string> = {
  sm: "h-4 min-w-4 px-0.5 text-[10px]",
  md: "h-5 min-w-5 px-1.5 text-xs",
}

/**
 * Unread/attention marker in its three forms: a bare dot (omit `value`), a small
 * count, and a regular count. One component so the shapes can't drift apart —
 * they had already drifted into four hand-rolled variants across the sidebar
 * and the filter bar, in two different blues and reds.
 *
 * Placement stays with the caller (`className`): an overlay badge on an icon
 * needs its own offsets, and baking one set of coordinates in here would only
 * be right for a single call site. `ring` cuts the marker out of whatever it
 * overlaps, so it stays legible on top of an icon or a filled button.
 */
export function Counter({
  value,
  size = "md",
  tone = "danger",
  ring = false,
  className,
}: {
  /** Omit for the plain dot — "something is new" without a number. */
  value?: number
  size?: CounterSize
  tone?: CounterTone
  /** Surface-coloured ring, for markers overlapping an icon or a button. */
  ring?: boolean
  className?: string
}) {
  const isDot = value === undefined

  return (
    <span
      aria-hidden={isDot || undefined}
      className={cn(
        "shrink-0 rounded-full",
        TONE[tone],
        ring && "border-2 border-surface",
        isDot
          ? DOT[size]
          : cn(
              "flex items-center justify-center font-semibold leading-none text-white",
              COUNT[size],
            ),
        className,
      )}
    >
      {!isDot && value}
    </span>
  )
}
