import { useLayoutEffect, useRef } from "react"

/**
 * Lands a thread scroller on its latest messages when the conversation
 * (or the scroller itself) appears.
 *
 * Overflowing chats start at `scrollTop` 0 — the oldest line. Pinning the
 * inner column with `justify-end` only helps when the thread is shorter than
 * the pane; once it overflows, the extra height sits below the fold and the
 * browser leaves the viewport at the top. This writes `scrollHeight` in a
 * layout effect so the jump happens before paint.
 *
 * Resize is observed too: hiding the mobile tab bar changes the pane height
 * after the first layout. Re-pin only while the viewport is still at the
 * bottom, so reading older messages is not yanked back.
 *
 * The key is the conversation id, not a list restoration key — coming back
 * to the appeals list still uses {@link useScrollRestoration}.
 */
export function useScrollToEnd<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    let stick = true

    const pin = () => {
      el.scrollTop = el.scrollHeight
    }

    const onScroll = () => {
      stick = el.scrollHeight - el.clientHeight - el.scrollTop < 2
    }

    pin()

    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(() => {
      if (stick) pin()
    })
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)

    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", onScroll)
    }
  }, [key])

  return ref
}
