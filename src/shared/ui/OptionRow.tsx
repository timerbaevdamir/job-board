import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Cell } from "@/shared/ui/Cell"
import { CheckIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"

/**
 * Checkbox glyph for a multi-select {@link OptionRow}. The row owns padding
 * and hover; this only says whether the option is on.
 */
export function CheckboxMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        checked
          ? "border-info bg-info text-white"
          : "border-2 border-border-strong text-transparent",
      )}
    >
      <CheckIcon className="size-3.5" strokeWidth={3} />
    </span>
  )
}

/**
 * Radio glyph for a single-select {@link OptionRow}. Same 20px box as the
 * checkbox, so swapping the slot does not shift the label.
 */
export function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 rounded-full border transition-colors",
        checked ? "border-[6px] border-info" : "border-2 border-border-strong",
      )}
    />
  )
}

type OptionRowProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Leading control — checkbox, radio, or nothing. */
  start?: ReactNode
  /** Trailing accessory — a count, a check, or nothing. */
  end?: ReactNode
  selected?: boolean
  children: ReactNode
}

/**
 * One choice in a list: filter options, sort, city. A {@link Cell} with the
 * selected glyph in a slot, so radio, checkbox and a trailing check cannot
 * drift into different paddings.
 */
export function OptionRow({
  start,
  end,
  selected,
  className,
  children,
  ...rest
}: OptionRowProps) {
  return (
    <Cell
      as="button"
      start={start}
      end={end}
      selected={selected}
      className={className}
      {...rest}
    >
      {children}
    </Cell>
  )
}
