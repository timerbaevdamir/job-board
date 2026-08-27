import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { SUGGESTION_POOL } from "@/entities/job"
import { ArrowLeftIcon, SearchIcon, XIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { ICON_BUTTON } from "@/shared/ui/iconButton"
import { useSearchField, type Overlay } from "../model/useSearchField"
import { useSearch } from "../model/store"
import { CityDrawer } from "./CityDrawer"
import { LISTBOX_ID, optionId, SuggestionList } from "./SuggestionList"
import { SEARCH_CARD } from "./searchCard"

/**
 * Last measured geometry, kept across mounts.
 *
 * Starting from zero every time meant the card grew to its real height right
 * after mounting — and anything above a scroll container that grows makes the
 * browser's scroll anchoring compensate, which silently moved a restored feed
 * position by exactly the filter bar's height. The field's geometry doesn't
 * change between visits, so remembering it lets the first paint be correct.
 */
let lastSize = { row: 52, filters: 0, list: 0 }

/**
 * Search combobox for a screen with room for it: one query row above one body,
 * where the body holds either the filter bar or the suggestions list. A phone
 * gets `MobileSearch` instead — there the field is a button and the list covers
 * the screen.
 *
 * It is a single card — one border, one radius, one shadow, one background —
 * and that is the whole point. The field and its dropdown were two sibling
 * boxes before, each drawing its own outline and its own shadow, kept in
 * agreement by hand: a shared radius, a `rounded-b-none` toggle, a hardcoded
 * top offset, and a measured minimum height so the field's corners wouldn't
 * poke out from under the panel. Two shadows also meant two shadows overlapping
 * wherever the boxes did. None of that exists here, because there is nothing to
 * keep in agreement.
 *
 * Layout: the card floats (absolute) inside a spacer that holds its *resting*
 * height, so growing to show suggestions expands it over the feed instead of
 * pushing the feed down. The filter bar stays mounted underneath the
 * suggestions — `inert` while covered — so the resting height never changes
 * while the user browses suggestions.
 *
 * The input is a WAI-ARIA combobox (`aria-expanded`, `aria-activedescendant`);
 * the overlay is a `listbox` of `option`s for arrow-key navigation and SRs.
 */
export function InlineSearch({
  recommendations,
  filters,
}: {
  recommendations?: string[]
  /** The in-field filter bar, supplied by the composing widget. */
  filters?: ReactNode
}) {
  const { query, setQuery, history, removeFromHistory } = useSearch()
  const {
    draft,
    setDraft,
    overlay,
    showFilters,
    suggestions,
    recommended,
    activeIndex,
    commit,
    close,
    inputProps,
  } = useSearchField({
    query,
    onQueryChange: setQuery,
    pool: SUGGESTION_POOL,
    recommendations,
    history,
  })

  const searchId = useId()
  const activeDescendant = activeIndex >= 0 ? optionId(activeIndex) : undefined
  const showOverlay = overlay !== null

  // The list stays mounted so it can fade out; while it does it keeps rendering
  // the last non-null overlay content instead of emptying.
  const lastOverlay = useRef<Exclude<Overlay, null>>("empty")
  if (overlay) lastOverlay.current = overlay
  const shown = overlay ?? lastOverlay.current

  // Both bodies are always mounted, so both can be measured at any time — the
  // card's height is then just "whichever one is showing".
  const rowRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(lastSize)

  // Height transitions stay off until after the first paint. The body starts at
  // an unmeasured 0 and only reaches its real height once the layout effect
  // below has run, so without this the bar unfurls from nothing every time the
  // field mounts — including on every return from another section, where the
  // filters were already applied and should simply be *there*.
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useLayoutEffect(() => {
    const nodes = [rowRef.current, filtersRef.current, listRef.current]
    if (nodes.some((n) => !n)) return
    const [row, bar, list] = nodes as HTMLElement[]

    const measure = () => {
      // Inside a display:none subtree (the feed behind the vacancy view)
      // offsetHeight collapses to 0 — keep the last real measurement.
      if (row.offsetParent === null) return
      const next = {
        row: row.offsetHeight,
        filters: bar.offsetHeight,
        list: list.offsetHeight,
      }
      lastSize = next
      setSize((prev) =>
        prev.row === next.row &&
        prev.filters === next.filters &&
        prev.list === next.list
          ? prev
          : next,
      )
    }
    measure()

    const ro = new ResizeObserver(measure)
    nodes.forEach((n) => ro.observe(n as HTMLElement))
    return () => ro.disconnect()
  }, [])

  const filtersHeight = showFilters ? size.filters : 0
  const bodyHeight = showOverlay ? size.list : filtersHeight
  // +2 for the card's own hairlines (border-box).
  const restingHeight = 2 + size.row + filtersHeight

  // Opening uses the eager ease-out. Closing onto the filter bar uses settle
  // so it doesn't dump the travel in the first frames. Folding all the way
  // away (clear) is the same curve, shorter — there is nothing to land on —
  // and the spacer shares it: it used to snap while the card was still easing,
  // so the feed jumped up under chips that hadn't finished clipping.
  const foldAway = !showOverlay && !showFilters
  const heightMotion = !animate
    ? "motion-reduce:transition-none"
    : foldAway
      ? "[transition:height_140ms_var(--ease-settle)] motion-reduce:transition-none"
      : showOverlay
        ? "[transition:height_200ms_var(--ease-soft)] motion-reduce:transition-none"
        : "[transition:height_200ms_var(--ease-settle)] motion-reduce:transition-none"

  // A control that unmounts in the same click that pressed it lets the leftover
  // event land on the field and reopen suggestions. Hold it for a tick.
  const [held, setHeld] = useState<"back" | "clear" | null>(null)
  useEffect(() => {
    if (!held) return
    const id = window.setTimeout(() => setHeld(null), 0)
    return () => window.clearTimeout(id)
  }, [held])

  const isolate = (
    event: {
      preventDefault(): void
      stopPropagation(): void
      currentTarget: EventTarget
    },
    kind: "back" | "clear",
    action: () => void,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.currentTarget instanceof HTMLElement) event.currentTarget.blur()
    // Shut the overlay in this tick. Blur is delayed 120ms so a mousedown on a
    // row still counts — but that delay with an emptied draft is the recents
    // list, and the card grew into it before folding away.
    inputProps.ref.current?.blur()
    close()
    setHeld(kind)
    action()
  }

  const inSearch = query.trim().length > 0
  const showBack = inSearch || held === "back"
  const showClear = draft.length > 0 || held === "clear"

  return (
    // Spacer: holds the card's resting height in the flow so the feed below
    // stays put no matter how far the card grows.
    <div className={cn("relative", heightMotion)} style={{ height: restingHeight }}>
      <div
        className={cn(
          SEARCH_CARD,
          "absolute inset-x-0 top-0 z-30",
          "transition-[box-shadow] duration-200 ease-soft motion-reduce:transition-none",
          // At rest the card is one surface among the cards below it, so the
          // lift stays faint. Open, it genuinely floats over the feed and says
          // so — one shadow on one box, deepened, never two overlapping.
          showOverlay
            ? "shadow-[0_1px_3px_rgba(13,21,32,0.05),0_12px_36px_-14px_rgba(13,21,32,0.18)]"
            : "shadow-field",
        )}
      >
        <div
          ref={rowRef}
          className="flex min-h-[52px] items-center gap-3 px-2.5"
        >
          {/* Same 36px cell as the clear control, so swapping the loupe for a
              back button does not shift the query. The glyph stays 24px either
              way — the search icon's size — and the circle is the hit target. */}
          {showBack ? (
            <button
              type="button"
              aria-label="Назад"
              onPointerDown={(event) => isolate(event, "back", () => commit(""))}
              onClick={(event) => isolate(event, "back", () => commit(""))}
              className={ICON_BUTTON}
            >
              <ArrowLeftIcon className="size-6" />
            </button>
          ) : (
            <label
              htmlFor={searchId}
              className="flex size-9 shrink-0 cursor-text items-center justify-center"
            >
              <SearchIcon className="size-6 text-subtle" />
            </label>
          )}
          <label className="flex min-w-0 flex-1 cursor-text items-center">
            <input
              id={searchId}
              type="text"
              role="combobox"
              aria-expanded={showOverlay}
              aria-controls={LISTBOX_ID}
              aria-activedescendant={activeDescendant}
              aria-autocomplete="list"
              placeholder="Профессия или должность"
              aria-label="Профессия или должность"
              className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
              {...inputProps}
            />
          </label>
          <div className="flex shrink-0 items-center">
            {showClear && (
              <button
                type="button"
                aria-label="Очистить поле"
                onPointerDown={(event) =>
                  isolate(event, "clear", () => setDraft(""))
                }
                onClick={(event) => isolate(event, "clear", () => setDraft(""))}
                className={ICON_BUTTON}
              >
                <XIcon className="size-6" />
              </button>
            )}
            <CityDrawer />
          </div>
        </div>

        {/* One animated height for the whole body: filters ⇄ suggestions is a
            single motion, not two panels negotiating. */}
        <div
          className={cn("relative overflow-hidden", heightMotion)}
          style={{ height: bodyHeight }}
        >
          {/* Kept mounted so the reveal can be measured; `invisible` rather
              than unmounting, because `offsetHeight` is how the card knows
              how far to grow. Hidden while there is no query — otherwise the
              chips (and their `z-20` scroller chrome) paint through the
              empty-focus suggestions. */}
          <div
            ref={filtersRef}
            inert={showOverlay || !showFilters}
            aria-hidden={!showFilters}
            className={cn(
              "absolute inset-x-0 top-0",
              !showFilters && "invisible",
            )}
          >
            {filters}
          </div>

          {/* Sits over the filter bar inside the same card, so it needs no
              border or shadow of its own — only an opaque background and the
              hairline that separates it from the query row. `z-10` when open
              so the bar's isolated chrome cannot stack above it. */}
          <div
            ref={listRef}
            aria-hidden={!showOverlay}
            className={cn(
              "absolute inset-x-0 top-0 border-t border-border bg-surface",
              "motion-reduce:transition-none",
              showOverlay
                ? // Fades in early so the content is legible while the card is
                  // still unfurling.
                  "z-10 opacity-100 [transition:opacity_140ms_var(--ease-soft)]"
                : foldAway
                  ? // Clearing leaves no filter bar to cover. Holding the list
                    // opaque while the card shrinks just shows suggestions
                    // getting clipped — fade with the fold instead.
                    "pointer-events-none opacity-0 [transition:opacity_90ms_var(--ease-soft)]"
                  : // Holds opaque until the height has almost finished closing,
                    // then dissolves over the last stretch. Fading it in step with
                    // the height would uncover empty card below the filter bar
                    // mid-collapse — which reads as a gap opening up.
                    "pointer-events-none opacity-0 [transition:opacity_90ms_var(--ease-soft)_110ms]",
            )}
          >
            <SuggestionList
              shown={shown}
              suggestions={suggestions}
              history={history}
              recommended={recommended}
              activeIndex={activeIndex}
              onSelect={commit}
              onRemoveFromHistory={removeFromHistory}
              className="max-h-[min(60vh,26rem)] overflow-y-auto p-2"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
