import { useMemo, useRef } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/Drawer"
import { Button } from "@/shared/ui/Button"
import { XIcon } from "@/shared/ui/icons"
import { vacancies } from "@/shared/lib/plural"
import { selectJobs } from "@/entities/job"
import { useSearch } from "../model/store"
import type { Filter, FilterOption } from "@/shared/config/filters"
import { FilterOptionList, type CountedOption } from "./FilterOptionList"

type Shown = {
  filter: Filter
  options: CountedOption[]
  selectedIds: string[]
}

/**
 * One filter's options as a bottom sheet — what a chip opens on a phone, where
 * the popover it opens on a wide screen has nowhere to go. A 320px panel hung
 * under a chip halfway along a scrolling strip either runs off the edge of a
 * 390px screen or gets pushed back under a chip it no longer points at.
 *
 * Sized to its content, not pinned to the top like the full-filters sheet: this
 * is five options, and a sheet that reserves the whole screen for them reads as
 * a heavier decision than picking a schedule actually is. The height can be
 * honest here because a single filter's option count doesn't change while it is
 * open — only the numbers beside them do.
 *
 * No draft state, exactly as in the popover and the catalog drawer: a toggle
 * writes straight to the search store and the feed behind has already changed.
 * The footer button isn't «Применить» — it reports the count the results
 * settled on and dismisses.
 */
export function FilterSheet({
  filter,
  options,
  selectedIds,
  onToggle,
  onClear,
  onClose,
}: {
  /** The open filter, or null when closed. */
  filter: Filter | null
  options: CountedOption[]
  selectedIds: string[]
  onToggle: (option: FilterOption) => void
  onClear: () => void
  onClose: () => void
}) {
  const { query, city, sort, filters: selection } = useSearch()
  const total = useMemo(
    () => selectJobs({ query, city, filters: selection, sort }).total,
    [query, city, selection, sort],
  )

  // The sheet has to keep rendering its contents while it slides away, and by
  // then the caller has already cleared which filter was open. Holding the last
  // one lets the panel leave with what it was showing instead of emptying on
  // the first frame of the exit.
  const last = useRef<Shown | null>(null)
  if (filter) last.current = { filter, options, selectedIds }
  const shown: Shown | null = filter
    ? { filter, options, selectedIds }
    : last.current

  if (!shown) return null

  return (
    <Drawer
      open={filter !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
      swipeDirection="down"
    >
      <DrawerContent size="content">
        <DrawerHeader
          action={
            // Icon only. `aria-label` is not rendered — it's what a screen
            // reader announces for a button whose whole content is a glyph.
            <DrawerClose
              aria-label="Закрыть"
              className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-chip hover:text-foreground"
            >
              <XIcon className="size-5" />
            </DrawerClose>
          }
        >
          <DrawerTitle>{shown.filter.label}</DrawerTitle>
        </DrawerHeader>

        {/* Rows carry their own vertical padding, so the list adds no gap — the
            hover fills of adjacent options meet instead of leaving a stripe. */}
        <div className="scroll-area flex min-h-0 flex-col overflow-y-auto px-4 pb-4">
          <FilterOptionList
            options={shown.options}
            multi={shown.filter.multi ?? false}
            selectedIds={shown.selectedIds}
            onToggle={onToggle}
          />
        </div>

        <DrawerFooter className="justify-between">
          <Button
            variant="tertiary"
            size="md"
            onClick={onClear}
            disabled={shown.selectedIds.length === 0}
          >
            Сбросить
          </Button>
          {/* Hugs its label: the count makes the text vary in width, and a
              stretched button pushed it past the sheet's edge. */}
          <Button variant="primary" size="md" onClick={onClose}>
            {total === 0
              ? "Ничего не найдено"
              : `Показать ${total} ${vacancies(total)}`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
