import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

/**
 * Shims for the parts of a browser jsdom does not implement, plus React
 * Testing Library's teardown.
 *
 * Each of these stands in for something the app genuinely uses. None of them
 * changes what the code under test does — they only give it the API it expects
 * to find, so a hook that measures or observes can be exercised at all.
 */

// A tree left mounted by one test is still in the document for the next.
afterEach(cleanup)

/**
 * jsdom has no layout engine, so nothing it renders has a size and there is
 * nothing for a ResizeObserver to report. Tests that care about geometry set
 * the dimensions themselves and call the callback when they want it; this only
 * has to exist so that constructing one doesn't throw.
 */
class NoopResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver

/**
 * jsdom implements no media queries at all — `matchMedia` is simply absent, and
 * `useLayoutMode` builds its query lists the moment it is imported.
 *
 * This is enough of an implementation to answer the only shape the app asks
 * for, `(width >= <length>)`, evaluated against `window.innerWidth`. Every list
 * it hands out is kept, so a test can resize the window the ordinary way —
 * assign `innerWidth`, dispatch `resize` — and the subscribers hear about it,
 * which is what makes the breakpoint hooks testable rather than merely
 * importable.
 */
const ROOT_FONT_SIZE = 16

function toPx(length: string): number {
  const value = Number.parseFloat(length)
  if (Number.isNaN(value)) return Number.POSITIVE_INFINITY
  return length.trim().endsWith("rem") ? value * ROOT_FONT_SIZE : value
}

type Listener = (event: MediaQueryListEvent) => void

const lists: { query: string; matches: boolean; listeners: Set<Listener> }[] = []

function evaluate(query: string): boolean {
  const min = /\(\s*width\s*>=\s*([\d.]+(?:px|rem))\s*\)/.exec(query)
  if (min) return window.innerWidth >= toPx(min[1])
  const legacy = /\(\s*min-width\s*:\s*([\d.]+(?:px|rem))\s*\)/.exec(query)
  if (legacy) return window.innerWidth >= toPx(legacy[1])
  // Anything else — `prefers-reduced-motion`, `hover` — reads as not matching,
  // which is the default the app is designed against.
  return false
}

globalThis.matchMedia ??= ((query: string) => {
  const entry = { query, matches: evaluate(query), listeners: new Set<Listener>() }
  lists.push(entry)
  return {
    get matches() {
      return entry.matches
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: Listener) => entry.listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => entry.listeners.delete(fn),
    addListener: (fn: Listener) => entry.listeners.add(fn),
    removeListener: (fn: Listener) => entry.listeners.delete(fn),
    dispatchEvent: () => false,
  } as unknown as MediaQueryList
}) as typeof matchMedia

window.addEventListener("resize", () => {
  for (const entry of lists) {
    const matches = evaluate(entry.query)
    if (matches === entry.matches) continue
    entry.matches = matches
    const event = { matches, media: entry.query } as MediaQueryListEvent
    entry.listeners.forEach((fn) => fn(event))
  }
})
