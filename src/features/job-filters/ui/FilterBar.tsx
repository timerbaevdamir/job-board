import { useMemo, useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersIcon,
} from "@/shared/ui/icons"
import { Counter } from "@/shared/ui/Counter"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import {
  CHIP_FILTERS,
  FILTERS,
  type FilterId,
  type FilterOption,
} from "@/shared/config/filters"
import { countOptions } from "@/entities/job"
import { useSearch } from "@/entities/search"
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
    ordered.map((f) => f.id).join(),
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
    // 4px on top, not 2: the count badge is offset -4px from its button, so a
    // smaller inset left it hanging above the bar's box — outside the body the
    // suggestions cover, where it stayed visible over the open list.
    // The space above the chips belongs to the scroller, not to this row: the
    // count badge overhangs its button by 4px, and only padding *inside* the
    // clipping element keeps that overhang out of the clip. Same total height
    // as before — 6px above, 12px below — just owned by the element that cuts.
    <div className="pb-2.5">
      {/* `isolate` is what makes the rest of this possible. The layers below
          need an order — chips, then the dissolve over them, then the pinned
          button above that, then the arrows — and ordering means `z-index`.
          Without a stacking context of its own those levels are compared
          against the whole document, which is how this button once ended up
          painted over the suggestions panel that covers the entire bar. */}
      <div className="relative isolate">
        {/* One markup for both layouts. The only difference between them is
          whether the filters button travels with the chips or holds its place,
          and that is what `position: sticky` is: in flow on a phone, pinned to
          the scrollport's edge from `sm`. A second copy of the button behind a
          breakpoint would be two things to keep in agreement for no gain.

          `pr-2.5` mirrors the button's inset at the far end. Padding inside a
          scroller only adds room *after* the last item — it doesn't hold chips
          back from the edge while there is still travel left, so a chip on its
          way out is still cut by the card's rounded corner rather than by a
          straight line drawn short of it. */}
        <div
          ref={ref}
          className="flex gap-2 overflow-x-auto pb-0.5 pr-2.5 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* The wrapper is what sticks: it can hold the opaque backdrop and
              the 10px inset, which a 36px circle cannot. Above the dissolve, so
              the button stays solid while the chips passing behind it don't. */}
          <div className="flex shrink-0 items-center bg-surface pl-2.5 sm:sticky sm:left-0 sm:z-20">
            <button
              type="button"
              aria-label="Все фильтры"
              onClick={() => setDrawerOpen(true)}
              className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-chip text-foreground transition-colors hover:bg-chip-hover"
            >
              <SlidersIcon className="size-5" />
              {/* Offsets put the badge's centre just outside the round button's
                rim — it is a circle, so `top-0 right-0` would sit the badge
                well inside the fill. The scroller's own top padding is what
                keeps the overhang out of its clip. */}
              {activeFilterCount > 0 && (
                <Counter
                  value={activeFilterCount}
                  size="sm"
                  tone="info"
                  className="absolute -right-1 -top-1"
                />
              )}
            </button>
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

        {/* Painted over the chips, under the button, above nothing else.
            The start fade begins where the pinned button ends, so a chip
            dissolves on its way behind it rather than meeting a hard edge; the
            end fade sits at the card's edge. Both are `sm:` only — on a phone
            the button travels with the chips, and there is nothing for them to
            disappear behind. */}
        <div
          aria-hidden
          className={cn(
            "edge-fade-start pointer-events-none absolute bottom-0.5 left-[46px] top-1.5 z-10 hidden w-12 transition-opacity duration-300 ease-soft sm:block",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "edge-fade-end pointer-events-none absolute bottom-0.5 right-0 top-1.5 z-10 hidden w-12 transition-opacity duration-300 ease-soft sm:block",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Arrows ride on top of their own fade — the backdrop that keeps a
            chip from showing around a bare circle. Bounded by the strip's
            padding rather than centred on it: that padding is asymmetric (6
            above, 2 below, to clear the count badge), so a centre would sit 2px
            off the chips it lines up with.

            They grow in rather than just brightening. Opacity alone changes
            nothing about a shape's size or place, so at these durations it
            registers as the thing being switched on; a few percent of scale
            gives the eye an arrival to follow. */}
        <button
          type="button"
          aria-label="Предыдущие фильтры"
          onClick={() => scrollBy(-1)}
          className={cn(
            "absolute bottom-0.5 left-[54px] top-1.5 z-30 my-auto hidden size-8 items-center justify-center rounded-full bg-surface text-foreground shadow-[0_1px_4px_rgba(13,21,32,0.12)] ring-1 ring-black/[0.06] transition-[opacity,transform] duration-200 ease-soft hover:bg-chip motion-reduce:transition-none sm:flex",
            canScrollLeft
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-75 opacity-0",
          )}
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        <button
          type="button"
          aria-label="Следующие фильтры"
          onClick={() => scrollBy(1)}
          className={cn(
            "absolute bottom-0.5 right-2.5 top-1.5 z-30 my-auto hidden size-8 items-center justify-center rounded-full bg-surface text-foreground shadow-[0_1px_4px_rgba(13,21,32,0.12)] ring-1 ring-black/[0.06] transition-[opacity,transform] duration-200 ease-soft hover:bg-chip motion-reduce:transition-none sm:flex",
            canScrollRight
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-75 opacity-0",
          )}
        >
          <ChevronRightIcon className="size-4" />
        </button>
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
