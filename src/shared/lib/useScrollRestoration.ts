import { useLayoutEffect, useRef } from "react"

/**
 * Last known scroll offset per key, kept at module scope because that is the
 * whole point: the component that owns the scroll container is gone by the time
 * we need to remember where it was.
 */
const positions = new Map<string, number>()

/**
 * Remembers where a scroll container was and puts it back when it returns.
 *
 * Navigating to another section unmounts the page, taking its scroll container
 * — and its `scrollTop` — with it, so coming back would otherwise always land
 * at the top.
 *
 * The position is recorded from the scroll event rather than on unmount. That
 * is not just simpler, it is more correct: a container hidden behind the
 * vacancy view (`display: none`) reports a `scrollTop` of 0, so reading it at
 * teardown would overwrite a good position with zero. Scroll events don't fire
 * while hidden, so the last recorded value stays the last real one.
 *
 * Restoring happens in a layout effect — before paint, so the jump is never
 * visible.
 */
export function useScrollRestoration<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const saved = positions.get(key)
    if (saved) el.scrollTop = saved

    const record = () => positions.set(key, el.scrollTop)
    el.addEventListener("scroll", record, { passive: true })
    return () => el.removeEventListener("scroll", record)
  }, [key])

  return ref
}

