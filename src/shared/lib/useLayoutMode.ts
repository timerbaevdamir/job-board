import { useSyncExternalStore } from "react"

/**
 * Tailwind's own breakpoints, restated here because JS has to agree with the
 * classes: `md` = 768, `lg` = 1024.
 */
const TABLET = "(min-width: 768px)"
const DESKTOP = "(min-width: 1024px)"

export type LayoutMode = "mobile" | "tablet" | "desktop"

// Created once: `read` runs on every render, and building a MediaQueryList each
// time would churn objects for a value that two long-lived ones already hold.
const tablet = matchMedia(TABLET)
const desktop = matchMedia(DESKTOP)

function subscribe(onChange: () => void) {
  tablet.addEventListener("change", onChange)
  desktop.addEventListener("change", onChange)
  return () => {
    tablet.removeEventListener("change", onChange)
    desktop.removeEventListener("change", onChange)
  }
}

function read(): LayoutMode {
  if (desktop.matches) return "desktop"
  if (tablet.matches) return "tablet"
  return "mobile"
}

/**
 * Which navigation shape the viewport calls for.
 *
 * This is deliberately JS rather than `md:` / `lg:` classes: the three modes
 * differ in *behaviour*, not only in appearance. Mobile has no rail at all and
 * navigates from a bottom bar; tablet keeps a rail whose labels live in a panel
 * that opens over the page; desktop shows those labels inline and never opens a
 * panel. Rendering all three and hiding two would mean three copies of the nav
 * in the DOM — and a panel that exists, focusable, on a viewport that has no
 * way to open it.
 *
 * `useSyncExternalStore` rather than an effect + state: the value is read
 * during render from an external source, which is exactly what it is for, and
 * it avoids the flash of a wrong mode on the first paint.
 */
export function useLayoutMode(): LayoutMode {
  return useSyncExternalStore(subscribe, read)
}
