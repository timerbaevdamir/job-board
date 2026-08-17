import { useMemo, useRef, useState } from "react"
import { CITIES, ANY_CITY } from "@/entities/job"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerVirtualKeyboardProvider,
} from "@/shared/ui/Drawer"
import { CheckIcon, NavigationIcon, SearchIcon } from "@/shared/ui/icons"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { useSearch } from "../model/store"

/**
 * City picker for the search field. The trigger reads as plain text until
 * hovered, so it doesn't compete with the input beside it; the panel itself is
 * a drawer because the same shell will carry the other pickers this field
 * needs (full filters, saved searches).
 *
 * Picking closes the drawer immediately — one tap, no confirm step — and
 * re-runs the search, because the city is a query parameter like any other.
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
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CITIES
    return CITIES.filter((c) => c.toLowerCase().includes(q))
  }, [query])

  const choose = (next: string) => {
    setCity(next)
    setOpen(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      swipeDirection={onPhone ? "down" : "right"}
      // Reset the filter for the next visit, once the closing animation is done
      // — clearing it on close would visibly reshuffle the list mid-transition.
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setQuery("")
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
          className="flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-base leading-[22px] text-foreground transition-colors hover:bg-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
          // The trigger sits inside the field's <label>; without this a click
          // would also focus the input and open the suggestions overlay.
          onMouseDown={(event) => event.preventDefault()}
        >
          <NavigationIcon className="size-4" />
          {city === ANY_CITY ? "Город" : city}
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
          <DrawerHeader>
            <DrawerTitle>Город поиска</DrawerTitle>
            <DrawerDescription>
              Вакансии с удалённой работой показываются в любом городе.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-2">
            <label className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5">
              <SearchIcon className="size-5 shrink-0 text-subtle" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск города"
                className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
              />
            </label>
          </div>

          <ul className="scroll-area flex-1 overflow-y-auto p-2">
            {visible.length === 0 && (
              <li className="px-4 py-6 text-center text-sm leading-5 text-muted">
                Ничего не найдено
              </li>
            )}
            {visible.map((c) => {
              const selected = c === city
              return (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => choose(c)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-chip"
                  >
                    {/* Every choice reads at full contrast; the checkmark is
                      what says which one is picked. Dimming the rest makes
                      available options look disabled. */}
                    <span className="text-base leading-[22px] text-foreground">
                      {c}
                    </span>
                    {selected && (
                      <CheckIcon className="size-4 text-info" strokeWidth={3} />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </DrawerContent>
      </DrawerVirtualKeyboardProvider>
    </Drawer>
  )
}
