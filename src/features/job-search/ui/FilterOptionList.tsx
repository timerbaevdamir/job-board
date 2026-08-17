import { CheckIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import type { FilterOption } from "@/shared/config/filters"

/** An option with the live count of what picking it would leave. */
export type CountedOption = FilterOption & { counter?: number }

/** A checkbox for `multi` filters, a radio for single-select ones. */
function OptionMark({
  checked,
  multi,
}: {
  checked: boolean
  multi: boolean
}) {
  if (multi) {
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
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 rounded-full border transition-colors",
        checked ? "border-[6px] border-info" : "border-2 border-border-strong",
      )}
    />
  )
}

/**
 * The rows of one filter's options — the single rendering of a choice in this
 * feature, used by all three places that offer one: the popover under a chip on
 * a wide screen, the sheet that replaces it on a phone, and the full catalog in
 * the drawer.
 *
 * It exists because those three had been the same twenty lines written twice
 * and about to be written a third time, and they had already drifted: the
 * popover dimmed its hover with a raw `black/4` while the drawer used the chip
 * token, and the two disagreed on whether a zero count was worth showing.
 *
 * `density` is the only thing they legitimately differ on. The popover is a
 * 320px panel beside a chip and sets its own text against that width; a sheet
 * and a drawer are read at arm's length on a phone and use the body size. That
 * is a real difference in context, not two people styling the same row.
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
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl py-2.5 text-left transition-colors hover:bg-chip",
              density === "compact" ? "px-3" : "px-2",
              empty && "opacity-45",
            )}
          >
            <OptionMark checked={checked} multi={multi} />
            <span
              className={cn(
                "min-w-0 flex-1 text-foreground",
                density === "compact"
                  ? "text-sm leading-5"
                  : "text-base leading-[22px]",
              )}
            >
              {option.label}
            </span>
            {option.counter !== undefined && (
              <span className="text-sm leading-5 tabular-nums text-muted">
                {option.counter}
              </span>
            )}
          </button>
        )
      })}
    </>
  )
}
