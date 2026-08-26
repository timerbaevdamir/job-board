import { CheckboxMark, OptionRow, RadioMark } from "@/shared/ui/OptionRow"
import { cn } from "@/shared/lib/cn"
import type { FilterOption } from "@/shared/config/filters"

/** An option with the live count of what picking it would leave. */
export type CountedOption = FilterOption & { counter?: number }

/**
 * The rows of one filter's options — the single rendering of a choice in this
 * feature, used by all three places that offer one: the popover under a chip on
 * a wide screen, the sheet that replaces it on a phone, and the full catalog in
 * the drawer.
 *
 * The row itself is {@link OptionRow}: same padding and hover as sort and the
 * city list. Radio vs checkbox is the `start` slot, not a second row.
 *
 * `density` is the only thing they legitimately differ on. The popover is a
 * 320px panel beside a chip and sets its own text against that width; a sheet
 * and a drawer are read at arm's length on a phone and use the body size.
 */
export function FilterOptionList({
  options,
  multi,
  selectedIds,
  onToggle,
  density = "comfortable",
}: {
  options: CountedOption[]
  multi: boolean
  selectedIds: string[]
  onToggle: (option: FilterOption) => void
  density?: "compact" | "comfortable"
}) {
  return (
    <>
      {options.map((option) => {
        const checked = selectedIds.includes(option.id)
        // Nothing to find down this branch given the query and the other
        // filters. Dimmed rather than hidden, so the list stays put as counts
        // move, and still clickable — picking it is how you trade one narrow
        // choice for another.
        const empty = (option.counter ?? 0) === 0 && !checked
        return (
          <OptionRow
            key={option.id}
            selected={checked}
            onClick={() => onToggle(option)}
            start={
              multi ? (
                <CheckboxMark checked={checked} />
              ) : (
                <RadioMark checked={checked} />
              )
            }
            end={
              option.counter !== undefined ? (
                <span className="text-sm leading-5 tabular-nums text-muted">
                  {option.counter}
                </span>
              ) : undefined
            }
            className={empty ? "opacity-45" : undefined}
          >
            <span
              className={cn(
                density === "compact"
                  ? "text-sm leading-5"
                  : "text-base leading-[22px]",
              )}
            >
              {option.label}
            </span>
          </OptionRow>
        )
      })}
    </>
  )
}
