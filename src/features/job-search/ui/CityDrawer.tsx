import { useCallback, useMemo, useRef, useState } from "react"
import { CITIES, POPULAR_CITIES, ANY_CITY } from "@/entities/job"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerVirtualKeyboardProvider,
} from "@/shared/ui/Drawer"
import { ICON_BUTTON } from "@/shared/ui/iconButton"
import { NavigationIcon, SearchIcon, XIcon } from "@/shared/ui/icons"
import { OptionRow, RadioMark } from "@/shared/ui/OptionRow"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { useSearch } from "../model/store"

const POPULAR_SET = new Set(POPULAR_CITIES)

function CityRow({
  name,
  selected,
  onPick,
}: {
  name: string
  selected: boolean
  onPick: (name: string) => void
}) {
  return (
    <OptionRow
      onClick={() => onPick(name)}
      start={<RadioMark checked={selected} />}
    >
      <span className="text-base leading-[22px]">{name}</span>
    </OptionRow>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="px-3 pb-2 pt-6 text-sm leading-5 text-muted">{children}</h3>
  )
}

/**
 * City picker for the search field. The trigger shows whatever is selected —
 * {@link ANY_CITY} when the search isn't restricted by location — as plain
 * text until hovered, so it doesn't compete with the input beside it. The
 * panel itself is the same drawer shell as the filter catalog — title, close,
 * option list — without the apply/reset footer those drawers need. Picking
 * writes the city and closes: there is no second step.
 */
export function CityDrawer() {
  const { city, setCity } = useSearch()
  // A phone gets a bottom sheet, everything wider a side panel. Not a
  // stylistic preference: on a 390px screen a side panel is a full-height slab
  // with a sliver of page beside it, and it is dismissed by a horizontal swipe
  // — the one gesture a thumb reaching across the screen performs worst. A
  // sheet is pulled down, which is where the thumb already is.
  const onPhone = useLayoutMode() === "mobile"
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // The list is portaled, so a layout effect on `open` can miss it. The
  // sentinel's ref fires when the node is in the tree; intersection then
  // tracks whether the first pixel of the list is still on screen.
  const setSentinelRef = useCallback((sentinel: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!sentinel) {
      setScrolled(false)
      return
    }
    const root = sentinel.parentElement
    if (!root) return
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { root, threshold: 0 },
    )
    observerRef.current = io
    io.observe(sentinel)
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return CITIES
    return CITIES.filter((c) => c.toLowerCase().includes(q))
  }, [search])

  const visibleSet = useMemo(() => new Set(visible), [visible])
  const showAny = visibleSet.has(ANY_CITY)
  const popular = POPULAR_CITIES.filter((c) => visibleSet.has(c))
  const rest = visible.filter((c) => c !== ANY_CITY && !POPULAR_SET.has(c))

  const pickCity = (name: string) => {
    setCity(name)
    setOpen(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setScrolled(false)
      }}
      swipeDirection={onPhone ? "down" : "right"}
      // Reset the filter for the next visit, once the closing animation is done
      // — clearing it on close would visibly reshuffle the list mid-transition.
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setSearch("")
      }}
    >
      {/* The list is searched by typing, so on a phone this drawer meets the
          software keyboard — the one thing no desktop browser will show you
          going wrong. */}
      <DrawerVirtualKeyboardProvider>
        <DrawerTrigger
          // Base UI returns focus here when the drawer closes, so a keyboard user
          // lands back on the trigger. The ring is ours rather than the browser's
          // default, which renders orange in some browsers and blue in others.
          //
          // On a phone this sits in the search sheet as a list row — the same
          // cell as a recent or a recommendation. On a wide screen it stays a
          // compact chip on the end of the field.
          className={
            onPhone
              ? "flex w-full items-center gap-3 rounded-xl py-3 pl-2 pr-1.5 text-left text-base leading-6 text-foreground transition-colors hover:bg-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
              : "flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-base leading-[22px] text-foreground transition-colors hover:bg-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
          }
          // The trigger sits inside the field's <label>; without this a click
          // would also focus the input and open the suggestions overlay.
          onMouseDown={(event) => event.preventDefault()}
        >
          <NavigationIcon
            className={onPhone ? "size-5 shrink-0 text-subtle" : "size-4"}
          />
          <span className="min-w-0 truncate">{city}</span>
        </DrawerTrigger>

        {/* Focus the search field rather than the panel: it's the control the
          user came for, and it keeps the ring on something that reads as
          focusable.

          `finalFocus` only restores focus to the trigger for keyboard closes.
          Restoring it after a click puts focus back on the chip, and the
          browser treats that programmatic focus as `:focus-visible` — so a
          plain mouse interaction left a focus ring sitting on the chip. A
          mouse user isn't tracking focus and doesn't need it back. */}
        <DrawerContent
          initialFocus={searchRef}
          finalFocus={(closeType) => closeType === "keyboard"}
          size="full"
        >
          <div className="relative z-10 shrink-0 bg-surface">
            <DrawerHeader
              action={
                <DrawerClose
                  aria-label="Закрыть"
                  className={cn("-mr-1", ICON_BUTTON)}
                >
                  <XIcon className="size-5" />
                </DrawerClose>
              }
            >
              <DrawerTitle>Город поиска</DrawerTitle>
            </DrawerHeader>

            <div className="px-6 pb-4">
              <label className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5">
                <SearchIcon className="size-5 shrink-0 text-subtle" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    if (listRef.current) listRef.current.scrollTop = 0
                    setScrolled(false)
                  }}
                  placeholder="Поиск города"
                  className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
                />
              </label>
            </div>

            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-border-strong transition-opacity",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            />
          </div>

          <div
            ref={listRef}
            onScroll={(event) =>
              setScrolled(event.currentTarget.scrollTop > 0)
            }
            className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8"
          >
            <div
              ref={setSentinelRef}
              aria-hidden
              className="-mb-px h-px w-full shrink-0"
            />
            {visible.length === 0 && (
              <p className="px-3 py-6 text-center text-sm leading-5 text-muted">
                Ничего не найдено
              </p>
            )}
            {showAny && (
              <CityRow
                name={ANY_CITY}
                selected={city === ANY_CITY}
                onPick={pickCity}
              />
            )}
            {popular.length > 0 && (
              <section>
                <SectionLabel>Популярные города</SectionLabel>
                {popular.map((name) => (
                  <CityRow
                    key={name}
                    name={name}
                    selected={city === name}
                    onPick={pickCity}
                  />
                ))}
              </section>
            )}
            {rest.length > 0 && (
              <section>
                <SectionLabel>Остальные города</SectionLabel>
                {rest.map((name) => (
                  <CityRow
                    key={name}
                    name={name}
                    selected={city === name}
                    onPick={pickCity}
                  />
                ))}
              </section>
            )}
          </div>
        </DrawerContent>
      </DrawerVirtualKeyboardProvider>
    </Drawer>
  )
}
