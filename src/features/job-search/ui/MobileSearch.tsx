import { useState, type ReactNode } from "react"
import { SUGGESTION_POOL } from "@/entities/job"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerVirtualKeyboardProvider,
} from "@/shared/ui/Drawer"
import { SearchIcon, XIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { useSearch } from "../model/store"
import { useSearchField } from "../model/useSearchField"
import { CityDrawer } from "./CityDrawer"
import { LISTBOX_ID, optionId, SuggestionList } from "./SuggestionList"

/**
 * Search on a phone: the field in the page is a button, and the search itself
 * happens in a sheet over the whole screen.
 *
 * Not a restyling of the inline combobox. A dropdown under a field assumes
 * there is a page left around it to drop over; on a phone the list is the
 * screen, and the keyboard takes half of what remains. Committing to a sheet
 * buys back what the inline version has to fight for — the list gets the full
 * height, the keyboard has somewhere to go, and dismissing is a swipe rather
 * than a tap on whatever is behind.
 *
 * The city moves in with it. In the field it was a second control competing for
 * a row that barely fits one; inside the sheet it sits under the input, where
 * it is part of describing the search rather than an ornament on the field.
 */
export function MobileSearch({
  recommendations,
  filters,
}: {
  recommendations?: string[]
  /** The in-field filter bar, supplied by the composing widget. */
  filters?: ReactNode
}) {
  const { query, setQuery } = useSearch()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* The same card the wide screen draws, minus everything it does not do
          here: no growing over the feed, no measured height, no overlay. What
          is left is a button above the filter chips. */}
      <div className="rounded-[28px] border border-border bg-surface shadow-field">
        <div className="flex min-h-[52px] items-center gap-3 pl-4 pr-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left"
          >
            <SearchIcon className="size-6 shrink-0 text-subtle" />
            {/* The committed query, not a draft: this row reports what the feed
                below is showing. Editing happens in the sheet. */}
            <span
              className={cn(
                "truncate text-base leading-[22px]",
                query ? "text-foreground" : "text-faint",
              )}
            >
              {query || "Профессия или должность"}
            </span>
          </button>
          {query.length > 0 && (
            // Its own button rather than part of the trigger: clearing is not
            // "open the search", and a button inside a button is not markup.
            <button
              type="button"
              aria-label="Очистить поиск"
              onClick={() => setQuery("")}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-black/[0.06] hover:text-foreground"
            >
              <XIcon className="size-5" />
            </button>
          )}
        </div>
        {filters}
      </div>

      <SearchSheet
        open={open}
        onOpenChange={setOpen}
        recommendations={recommendations}
      />
    </>
  )
}

function SearchSheet({
  open,
  onOpenChange,
  recommendations,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendations?: string[]
}) {
  const { query, setQuery, history, removeFromHistory } = useSearch()
  const {
    draft,
    setDraft,
    suggestions,
    recommended,
    activeIndex,
    commit,
    inputProps,
  } = useSearchField({
    query,
    onQueryChange: setQuery,
    pool: SUGGESTION_POOL,
    recommendations,
    history,
  })

  // The sheet *is* the overlay, so what it shows follows the text rather than
  // the focus. Inline, the list has to appear and disappear around a field that
  // stays on screen; here there is nothing to reveal — the panel is already
  // open, and the only question is whether there is anything typed to match.
  const shown = draft.trim().length > 0 ? "suggestions" : "empty"

  const choose = (value: string) => {
    commit(value)
    onOpenChange(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="down"
      // Put the draft back to what the feed is actually showing, once the sheet
      // has gone. Abandoning a half-typed query should leave no trace; doing it
      // before the animation ends would rewrite the text as it slides away.
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setDraft(query)
      }}
    >
      {/* The one drawer in the app that exists to be typed into. */}
      <DrawerVirtualKeyboardProvider>
        <DrawerContent size="full" initialFocus={inputProps.ref}>
          <div className="flex shrink-0 items-center gap-1 px-3 pb-2 pt-1">
            <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-chip px-3 py-2.5">
              <SearchIcon className="size-5 shrink-0 text-subtle" />
              <input
                type="text"
                role="combobox"
                // Always expanded: the list is the sheet, and it is on screen
                // for as long as this input is.
                aria-expanded
                aria-controls={LISTBOX_ID}
                aria-activedescendant={
                  activeIndex >= 0 ? optionId(activeIndex) : undefined
                }
                aria-autocomplete="list"
                placeholder="Профессия или должность"
                className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
                {...inputProps}
              />
              {draft.length > 0 && (
                // Empties the field without committing — the keyboard stays up
                // and the reader carries on typing.
                <button
                  type="button"
                  aria-label="Очистить"
                  onClick={() => setDraft("")}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </label>
            <DrawerClose className="shrink-0 rounded-full px-3 py-2 text-base leading-[22px] text-foreground transition-colors hover:bg-chip">
              Отмена
            </DrawerClose>
          </div>

          {/* The city, now that there is room for it to be a row rather than a
              tag squeezed onto the end of the input. */}
          <div className="flex shrink-0 items-center border-b border-border px-3 pb-3">
            <CityDrawer />
          </div>

          <SuggestionList
            shown={shown}
            suggestions={suggestions}
            history={history}
            recommended={recommended}
            activeIndex={activeIndex}
            onSelect={choose}
            onRemoveFromHistory={removeFromHistory}
            className="scroll-area min-h-0 flex-1 overflow-y-auto p-2"
          />
        </DrawerContent>
      </DrawerVirtualKeyboardProvider>
    </Drawer>
  )
}
