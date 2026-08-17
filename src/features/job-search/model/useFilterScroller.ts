import { useEffect, useRef, useState } from "react"

/**
 * Tracks whether the chip scroller has anything left in either direction, so
 * each edge's fade and arrow only appear while it does. A ResizeObserver on the
 * element itself, not just window resize — the chip set and the font can change
 * the answer without the window moving.
 *
 * `revision` re-measures when the chip set changes; `enabled` skips work while
 * the scroller is hidden. A single scalar rather than a spread dependency list:
 * a list of unknown length can't be checked statically, and it was the only
 * place in the project still arguing with the linter about it.
 */
export function useFilterScroller(enabled: boolean, revision: string = "") {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    const update = () => {
      // Both settle at their boundary, so React bails out of the re-render
      // while the strip is scrolling in between.
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [enabled, revision])

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 240, behavior: "smooth" })
  }

  return { ref, canScrollLeft, canScrollRight, scrollBy }
}
