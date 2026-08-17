import { useSyncExternalStore } from "react"

export type LayoutMode = "mobile" | "tablet" | "desktop"

/**
 * The breakpoint as the stylesheet defines it — not a copy of it.
 *
 * These used to be two numbers written here to match two numbers in the CSS,
 * with nothing holding them together: change one and the apply bar and the tab
 * bar would disagree about where the phone ends. `--breakpoint-*` is declared
 * in `index.css` (see the `@theme static` block), Tailwind builds its variants
 * from it, and this reads the same property back.
 *
 * The query is spelled the way Tailwind spells it — range syntax, not
 * `min-width` — so the two cannot even diverge in how a browser parses them. A
 * browser too old for `width >=` fails to match here *and* fails to apply the
 * `md:` rules, which lands both on the mobile layout together.
 */
function breakpoint(name: "sm" | "md" | "lg", fallback: string): MediaQueryList {
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${name}`)
    .trim()
  return matchMedia(`(width >= ${declared || fallback})`)
}

// Created once: `read` runs on every render, and building a MediaQueryList each
// time would churn objects for a value that two long-lived ones already hold.
// The fallbacks only apply if the stylesheet has not been applied yet, which
// would be a larger problem than this module's.
const tablet = breakpoint("md", "48rem")
const desktop = breakpoint("lg", "64rem")

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
 * This is deliberately JS rather than `md:` / `lg:` classes alone: the three modes
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
