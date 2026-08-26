import { useMemo, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersIcon,
} from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { Counter } from "@/shared/ui/Counter"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import {
  CHIP_FILTERS,
  FILTERS,
  type FilterId,
  type FilterOption,
} from "@/shared/config/filters"
import { countOptions } from "@/entities/job"
import { useSearch } from "../model/store"
import { orderFilters } from "../lib/orderFilters"
import { useFilterScroller } from "../model/useFilterScroller"
import { FilterChip } from "./FilterChip"
import { FilterDrawer } from "./FilterDrawer"
import { FilterPopover } from "./FilterPopover"
import { FilterSheet } from "./FilterSheet"

/**
 * Horizontal, scrollable strip of filter chips with per-chip popovers.
 *
 * Selection lives in the search store (changing it re-runs the query), each
 * chip renders itself, and the popover positions itself against the open chip.
 * What is left here is the composition: which chip is open, the option counts
 * for that one, and the scroller chrome.
 */
export function FilterBar() {
  const {
    query,
    city,
    sort,
    filters: selection,
    activeFilterCount,
    toggleFilterOption,
    clearFilter,
  } = useSearch()
  // Only which filter's popover is open — by id, never by element. Selecting an
  // option re-renders that chip into its "active" form and can float it to the
  // front of the strip, so any element captured on click is a detached node a
  // moment later. The popover re-finds the live chip by this id instead.
  const [openId, setOpenId] = useState<FilterId | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // A chip's options open as a panel hung under it on a wide screen and as a
  // bottom sheet on a phone. Not a restyling of one thing: a 320px panel
  // anchored to a chip halfway along a scrolling strip has nowhere to sit on a
  // 390px screen — it either runs off the edge or is pushed back under a chip
  // it no longer points at. The sheet answers to the screen instead of to the
  // chip, and there is no anchor left to lose.
  const onPhone = useLayoutMode() === "mobile"
  // `?? null` rather than a bare `find`: the sheet stays mounted across the
  // close and takes the absence of a filter as its cue to leave, so it needs
  // the one falsy value, not two.
  const openFilter = FILTERS.find((f) => f.id === openId) ?? null

  const selectedOf = (id: FilterId) => selection[id] ?? []
  const ordered = useMemo(
    () => orderFilters(CHIP_FILTERS, selection),
    [selection],
  )

  // Live counts for the open popover only — no point costing the other five.
  // Recomputed when the query or any selection changes, so the numbers track
  // what the user has already narrowed down.
  const optionsWithCounts = useMemo(() => {
    if (!openFilter) return []
    const counts = countOptions(
      { query, city, filters: selection, sort },
      openFilter.id,
      openFilter.options.map((o) => o.id),
    )
    return openFilter.options.map((o) => ({ ...o, counter: counts[o.id] ?? 0 }))
  }, [openFilter, query, city, selection, sort])

  // The chip order as one value: what the scroller actually needs to know is
  // "did the strip's contents change".
  const { ref, canScrollLeft, canScrollRight, scrollBy } = useFilterScroller(
    true,
    `${ordered.map((f) => f.id).join()}:${activeFilterCount}`,
  )

  const openPopover = (id: FilterId) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  // Multi: toggle the option and keep the popover open. Single (radio): replace
  // the selection and close immediately.
  const toggleOption = (id: FilterId, multi: boolean, option: FilterOption) => {
    toggleFilterOption(id, option.id, multi)
    if (!multi) setOpenId(null)
  }

  const handleClear = (id: FilterId) => {
    clearFilter(id)
    setOpenId(null)
  }

  return (
    <div className="pb-2.5">
      {/* `isolate` keeps the strip's z-index from leaking: this chrome once
          painted over the suggestions panel that covers the whole bar. */}
      <div className="relative isolate">
        {/* The "all filters" chip is chrome, not a scroll item — sticky
            inside overflow rubber-bands with the chips in Chrome. From `sm`
            it sits beside the scroller; on a phone it travels with the chips.

            The two walls are different objects: left is this chip, right is
            the card. Each edge is the same 48px cluster (fade + inset arrow)
            hung on its wall, so a count widening the chip moves the left
            cluster and cannot desync it. `overscroll-x-none` stops the chips
            bouncing a hole under the fade. */}
        <div className="flex min-w-0 items-center sm:gap-2">
          <div className="relative z-20 hidden shrink-0 pl-2.5 sm:block">
            <AllFiltersChip
              count={activeFilterCount}
              onClick={() => setDrawerOpen(true)}
            />
            <StripEdge
              side="start"
              visible={canScrollLeft}
              onClick={() => scrollBy(-1)}
            />
          </div>

          <div className="relative min-w-0 flex-1">
            <div
              ref={ref}
              className="flex min-w-0 items-center gap-2 overflow-x-auto overflow-y-hidden overscroll-x-none pr-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex shrink-0 items-center pl-2.5 sm:hidden">
                <AllFiltersChip
                  count={activeFilterCount}
                  onClick={() => setDrawerOpen(true)}
                />
              </div>

              {ordered.map((f) => (
                <FilterChip
                  key={f.id}
                  filter={f}
                  selected={selectedOf(f.id)}
                  open={openId === f.id}
                  onOpen={() => openPopover(f.id)}
                  onClear={() => handleClear(f.id)}
                />
              ))}
            </div>

            <StripEdge
              side="end"
              visible={canScrollRight}
              onClick={() => scrollBy(1)}
            />
          </div>
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Both are handed the same options, selection and callbacks — they are
          two presentations of one choice, not two features. Only one is
          mounted: the popover has no exit transition and can unmount with its
          filter, while the sheet has to outlive it to slide away, so it stays
          mounted and takes the null itself. */}
      {onPhone ? (
        <FilterSheet
          filter={openFilter}
          options={optionsWithCounts}
          selectedIds={openFilter ? selectedOf(openFilter.id) : []}
          onToggle={(option) =>
            openFilter &&
            toggleOption(openFilter.id, openFilter.multi ?? false, option)
          }
          onClear={() => openFilter && handleClear(openFilter.id)}
          onClose={() => setOpenId(null)}
        />
      ) : (
        openFilter && (
          <FilterPopover
            options={optionsWithCounts}
            multi={openFilter.multi ?? false}
            selectedIds={selectedOf(openFilter.id)}
            anchorId={openFilter.id}
            onToggle={(option) =>
              toggleOption(openFilter.id, openFilter.multi ?? false, option)
            }
            onClear={() => handleClear(openFilter.id)}
            onClose={() => setOpenId(null)}
          />
        )
      )}
    </div>
  )
}

/**
 * The strip's "all filters" chip: icon, the word, and a count pill when
 * something is on. Applied wears the same tint as a live category chip.
 *
 * The pill is 16px — inside the 20px text line, so applying a filter cannot
 * grow the chip's height and shove the drawer. It does grow the width; the
 * left fade/arrow hangs on this chip, so that cluster moves with it rather
 * than covering the new edge. Tighter right padding when the pill is on: it
 * already has its own inset, and the uncounted `pr-3.5` on top of that would
 * leave a hole.
 */
function AllFiltersChip({
  count,
  onClick,
}: {
  count: number
  onClick: () => void
}) {
  const counted = count > 0
  return (
    <button
      type="button"
      aria-label={counted ? `Фильтры, ${count}` : "Фильтры"}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border py-1.5 pl-2.5 text-sm font-semibold leading-5 transition-colors",
        counted
          ? "border-transparent bg-info/10 pr-2 text-info hover:bg-info/15"
          : "border-transparent bg-chip pr-3.5 text-foreground hover:bg-chip-hover",
      )}
    >
      <SlidersIcon className="size-4" />
      Фильтры
      {counted && <Counter value={count} size="sm" tone="info" />}
    </button>
  )
}

/** Fade + arrow as one 48px cluster. Hung on the wall it belongs to: the
 *  filters chip on the start, the card on the end. Geometry inside is the
 *  same — fade to the chips, arrow 8px from the filters chip and 10px
 *  from the card. */
function StripEdge({
  side,
  visible,
  onClick,
}: {
  side: "start" | "end"
  visible: boolean
  onClick: () => void
}) {
  const isStart = side === "start"
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 hidden w-12 sm:block",
        isStart ? "left-full" : "right-0",
      )}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          isStart ? "edge-fade-start" : "edge-fade-end",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <button
        type="button"
        aria-label={isStart ? "Предыдущие фильтры" : "Следующие фильтры"}
        onClick={onClick}
        className={cn(
          "pointer-events-auto absolute inset-y-0 z-10 my-auto flex size-8 items-center justify-center rounded-full bg-surface text-foreground shadow-[0_1px_4px_rgba(13,21,32,0.12)] ring-1 ring-black/[0.06] transition-[opacity,transform] hover:bg-chip motion-reduce:transition-none",
          isStart ? "left-2" : "right-2.5",
          visible
            ? "scale-100 opacity-100 duration-150 ease-soft"
            : "pointer-events-none scale-95 opacity-0 duration-100 ease-in",
        )}
      >
        {isStart ? (
          <ChevronLeftIcon className="size-4" />
        ) : (
          <ChevronRightIcon className="size-4" />
        )}
      </button>
    </div>
  )
}

