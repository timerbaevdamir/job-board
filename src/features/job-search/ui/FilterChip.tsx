import { ChevronDownIcon, XIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import type { Filter } from "@/shared/config/filters"

/**
 * What the chip says: the chosen option when there is one, "первый +N" for
 * several, otherwise the neutral category name.
 */
function chipLabel(filter: Filter, selected: string[]): string {
  if (selected.length === 0) return filter.label
  const first =
    filter.options.find((o) => o.id === selected[0])?.label ?? filter.label
  return selected.length > 1 ? `${first} +${selected.length - 1}` : first
}

/**
 * One filter chip, in both of its states.
 *
 * Applied and unapplied share a single element and a single set of layout
 * classes; only colours differ. Two things follow from that, and both were
 * real bugs when the states were separate branches:
 *
 * - The box is identical, so applying a filter can't change the chip's height
 *   and shove the drawer (and the feed under it) down. Both states carry a
 *   transparent border, so the fill swap never changes the outer size.
 * - The element is never swapped for a different tag, so the DOM node survives
 *   being applied. Anything anchored to it — the popover — stays anchored.
 *
 * The two padded buttons together cover the whole chip, so there is no dead
 * strip along the edges where a click does nothing.
 */
export function FilterChip({
  filter,
  selected,
  open,
  onOpen,
  onClear,
}: {
  filter: Filter
  /** Chosen option ids for this filter; empty means unapplied. */
  selected: string[]
  /** Whether this chip's popover is the open one. */
  open: boolean
  onOpen: () => void
  onClear: () => void
}) {
  const applied = selected.length > 0

  return (
    <span
      data-filter-chip={filter.id}
      className={cn(
        "flex shrink-0 items-center rounded-full border text-sm font-semibold leading-5 transition-colors",
        // `cn` does not merge: text colour lives in the branch, not as a base
        // class the applied tint is expected to beat.
        applied
          ? "border-transparent bg-info/10 text-info hover:bg-info/15"
          : open
            ? "border-transparent bg-chip-hover text-foreground"
            : "border-transparent bg-chip text-foreground hover:bg-chip-hover",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onOpen}
        className={cn(
          "flex items-center gap-1 py-1.5 pl-3.5 text-left",
          applied ? "pr-1.5" : "pr-3",
        )}
      >
        {chipLabel(filter, selected)}
        {!applied && (
          <ChevronDownIcon
            className={cn(
              "size-4 text-subtle transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {applied && (
        <button
          type="button"
          aria-label={`Сбросить «${filter.label}»`}
          onClick={onClear}
          className="flex items-center py-1.5 pr-2 transition-colors hover:opacity-70"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </span>
  )
}
