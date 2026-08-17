import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { SearchIcon } from "@/shared/ui/icons"
import { Button } from "@/shared/ui/Button"
import type { FilterOption } from "@/shared/config/filters"
import { FilterOptionList, type CountedOption } from "./FilterOptionList"

const PANEL_WIDTH = 320
// Show the search field only when the list is long enough to warrant it.
const SEARCH_THRESHOLD = 7

type Rect = { left: number; bottom: number }

const same = (a: Rect | null, b: Rect) =>
  a !== null && a.left === b.left && a.bottom === b.bottom

/**
 * Tracks the anchor chip's viewport position, re-measuring whenever it can move:
 * window resize, any scroll in the page (captured, so the chip row's own
 * horizontal scroll counts too), and after every render of this popover — which
 * is what catches the chip being reordered or re-rendered underneath it.
 *
 * The chip is looked up in the live DOM by id on every measurement rather than
 * held as a node. Selecting an option turns a chip from a plain button into a
 * bordered one with a clear button, so React replaces the element: a stored
 * reference would be pointing at a detached node, whose rect is all zeros —
 * and the panel would jump to the top-left corner of the screen.
 */
function useAnchorRect(anchorId: string): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null)

  // No dependency array: re-measuring after every render is what keeps the
  // panel attached when the chip strip reorders. `same` guards the state
  // update, so a measurement that hasn't changed can't loop.
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-filter-chip="${anchorId}"]`,
      )
      if (!el) return
      const r = el.getBoundingClientRect()
      setRect((prev) =>
        same(prev, { left: r.left, bottom: r.bottom })
          ? prev
          : { left: r.left, bottom: r.bottom },
      )
    }
    measure()

    window.addEventListener("resize", measure)
    // Capture phase: scroll doesn't bubble, so this is what catches scrolling
    // inside the chip strip and any other ancestor scroller.
    window.addEventListener("scroll", measure, true)

    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  })

  return rect
}

/**
 * Filter popover anchored under a chip. `multi` renders left checkboxes and lets
 * several options coexist; otherwise the cells are single-select radios. Picking
 * applies immediately (no «Применить»). The search field appears only for long
 * lists, and «Сбросить» only when something is selected.
 */
export function FilterPopover({
  options,
  multi,
  selectedIds,
  anchorId,
  onToggle,
  onClear,
  onClose,
}: {
  options: CountedOption[]
  multi: boolean
  selectedIds: string[]
  /**
   * Filter id of the chip to hang under. Looked up in the DOM on each
   * measurement (`data-filter-chip`), so it survives the chip being replaced
   * or reordered while the panel is open.
   */
  anchorId: string
  onToggle: (option: FilterOption) => void
  onClear: () => void
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const showSearch = options.length >= SEARCH_THRESHOLD
  const rect = useAnchorRect(anchorId)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, query])

  // Wait for the first measurement so the panel never paints at 0,0.
  if (!rect) return null

  // Keep the panel within the viewport horizontally.
  const left = Math.max(
    16,
    Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 16),
  )
  const top = rect.bottom + 8

  // Portal to the body so `position: fixed` escapes the search field's clipping
  // and transformed (animated) ancestors, which would otherwise be its
  // containing block and clip the panel.
  return createPortal(
    <>
      {/* Click-away layer. Marked presentational: it carries no content and
          duplicates a keyboard path that already exists (Escape), so it should
          not appear to assistive tech as something to interact with. */}
      <div
        role="presentation"
        aria-hidden
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div
        role="dialog"
        style={{ left, top, width: PANEL_WIDTH }}
        className="fixed z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_12px_40px_rgba(0,0,0,0.16)]"
      >
        {showSearch && (
          <>
            <div className="p-3">
              <label className="flex items-center gap-2 rounded-xl bg-chip px-3 py-2.5">
                <SearchIcon className="size-5 shrink-0 text-subtle" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск"
                  className="min-w-0 flex-1 bg-transparent text-sm leading-5 text-foreground placeholder:text-faint focus:outline-none"
                />
              </label>
            </div>
            <span className="h-px w-full shrink-0 bg-border" />
          </>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {visible.length > 0 ? (
            <FilterOptionList
              options={visible}
              multi={multi}
              selectedIds={selectedIds}
              onToggle={onToggle}
              density="compact"
            />
          ) : (
            <p className="px-4 py-6 text-center text-sm leading-5 text-muted">
              Ничего не найдено
            </p>
          )}
        </div>

        {selectedIds.length > 0 && (
          <>
            <span className="h-px w-full shrink-0 bg-border" />
            <div className="p-2">
              <Button variant="tertiary" size="sm" fullWidth onClick={onClear}>
                Сбросить
              </Button>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  )
}
