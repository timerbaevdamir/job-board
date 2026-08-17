import { useMemo } from "react"
import {
  FILTERS,
  type Filter,
  type FilterOption,
} from "@/shared/config/filters"
import { countOptions, selectJobs } from "@/entities/job"
import { useSearch } from "../model/store"
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
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { vacancies } from "@/shared/lib/plural"
import { FilterOptionList } from "./FilterOptionList"

function FilterSection({
  filter,
  selected,
  counts,
  onToggle,
}: {
  filter: Filter
  selected: string[]
  counts: Record<string, number>
  onToggle: (option: FilterOption) => void
}) {
  const multi = filter.multi ?? false
  return (
    // Rows carry their own vertical padding, so the section adds no gap — the
    // hover fills of adjacent options meet instead of leaving a stripe.
    <section className="flex flex-col p-4">
      <h3 className="px-2 pb-2 pt-1 text-sm leading-5 text-muted">
        {filter.label}
      </h3>
      <FilterOptionList
        options={filter.options.map((option) => ({
          ...option,
          counter: counts[option.id] ?? 0,
        }))}
        multi={multi}
        selectedIds={selected}
        onToggle={onToggle}
      />
    </section>
  )
}

/**
 * The whole filter catalog in one panel — the chips' long form, plus the
 * categories that never earned a chip (`chip: false`).
 *
 * There is no draft state here. Every toggle writes straight to the search
 * store, exactly like a chip does, so the two views can't disagree: open the
 * drawer and the chips' selection is already reflected, close it and the chips
 * show what was picked. The footer button therefore isn't an "apply" — the
 * results are already live behind the drawer, and it reports the count they
 * settled on before dismissing.
 */
export function FilterDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const {
    query,
    city,
    sort,
    filters: selection,
    activeFilterCount,
    toggleFilterOption,
    resetFilters,
  } = useSearch()
  const onPhone = useLayoutMode() === "mobile"

  // Memoized so it is a stable dependency rather than a fresh object every
  // render — which is what previously forced the dependency lists below to be
  // written out by hand and the lint rule to be silenced.
  const params = useMemo(
    () => ({ query, city, filters: selection, sort }),
    [query, city, selection, sort],
  )

  // Faceted counts for every section, and the total the current selection
  // yields. Computed synchronously off the same pure core the request uses, so
  // the footer can promise a number the feed will actually show.
  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map((f) => [
          f.id,
          countOptions(
            params,
            f.id,
            f.options.map((o) => o.id),
          ),
        ]),
      ),
    [params],
  )

  const total = useMemo(() => selectJobs(params).total, [params])

  return (
    // A phone gets a bottom sheet, everything wider a side panel — a
    // horizontal swipe is the worst gesture to ask of a thumb already at the
    // bottom of the screen. `full` rather than `content` because the sections
    // are long and their counts change: a content-sized sheet would resize
    // under the reader as the numbers move.
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={onPhone ? "down" : "right"}
    >
      <DrawerContent
        finalFocus={(closeType) => closeType === "keyboard"}
        size="full"
      >
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
          <DrawerTitle>Фильтры</DrawerTitle>
        </DrawerHeader>

        <div className="scroll-area flex-1 divide-y divide-border overflow-y-auto">
          {FILTERS.map((f) => (
            <FilterSection
              key={f.id}
              filter={f}
              selected={selection[f.id] ?? []}
              counts={counts[f.id] ?? {}}
              onToggle={(option) =>
                toggleFilterOption(f.id, option.id, f.multi ?? false)
              }
            />
          ))}
        </div>

        <DrawerFooter className="justify-between">
          <Button
            variant="tertiary"
            size="md"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
          >
            Сбросить
          </Button>
          {/* Hugs its label: the count makes the text vary in width, and a
              stretched button pushed it past the drawer's edge. */}
          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            {total === 0
              ? "Ничего не найдено"
              : `Показать ${total} ${vacancies(total)}`}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
