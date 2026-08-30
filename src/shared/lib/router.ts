import { useCallback, useSyncExternalStore } from "react"

/**
 * Where the app currently is. Hash-based on purpose: the prototype is served as
 * static files (Figma Make preview, `vite preview`, any static host) with no
 * server-side rewrites, so a History-API path would 404 on a direct link or a
 * refresh. Everything after `#` never reaches the server.
 */
export type Route = { name: "search" } | { name: "job"; jobId: string } | {
  name: "appeals"
  appealId?: string
} | /** A primary-nav section that is not search or appeals (saved, activity, profile). */
{ name: "section"; section: string } | { name: "dev" }

/** Parse `window.location.hash` into a {@link Route}. Pure. */
export function parseRoute(hash: string): Route {
  const segments = hash.replace(/^#/, "").split("/").filter(Boolean)
  const [head, tail] = segments

  if (!head || head === "search") return { name: "search" }
  if (head === "dev") return { name: "dev" }
  if (head === "job")
    return tail ? { name: "job", jobId: tail } : { name: "search" }
  if (head === "appeals") return { name: "appeals", appealId: tail }
  return { name: "section", section: head }
}

/** Serialize a {@link Route} back into a hash. Pure, inverse of `parseRoute`. */
export function routeToHash(route: Route): string {
  switch (route.name) {
    case "search":
      return "#/"
    case "job":
      return `#/job/${route.jobId}`
    case "appeals":
      return route.appealId ? `#/appeals/${route.appealId}` : "#/appeals"
    case "section":
      return `#/${route.section}`
    case "dev":
      return "#/dev"
  }
}

/**
 * Which primary-nav item should read as active for a route — the vacancy screen
 * still belongs to "Поиск".
 */
export function activeSection(route: Route): string {
  switch (route.name) {
    case "search":
    case "job":
      return "search"
    case "appeals":
      return "appeals"
    case "section":
      return route.section
    case "dev":
      return ""
  }
}

/**
 * Which way the last navigation went through the history stack.
 *
 * A screen transition has to know this: going deeper and coming back are the
 * same two screens moving in opposite directions, and playing the wrong one
 * makes Back look like it opened something new.
 */
export type NavDirection = "push" | "pop" | "replace"

/**
 * Compare two history depths. Pure, so the one piece of this that has real
 * logic can be tested without a history stack to drive.
 */
export function directionOf(from: number, to: number): NavDirection {
  if (to > from) return "push"
  if (to < from) return "pop"
  return "replace"
}

/**
 * How deep in the stack each history entry sits.
 *
 * The hash alone can't answer "did we go forward or back" — `#/job/j-7` reads
 * the same whether it was just opened or just returned to. `hashchange` doesn't
 * say either. So every entry this module creates carries its own depth, and the
 * direction is the difference between the one we were on and the one we are on
 * now. That is also why navigation moved from `location.hash = …` to
 * `pushState`: only the History API lets an entry carry anything.
 */
type NavState = { d?: number; via?: "appeal"; from?: string }

const depthOf = (state: unknown): number | null => {
  const d = (state as NavState | null)?.d
  return typeof d === "number" ? d : null
}

let depth = 0
let direction: NavDirection = "replace"
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach((notify) => notify())
}

/**
 * Adopt an entry this module didn't create — the URL the app was opened on, or
 * a hash typed into the address bar. It carries no depth of its own, so it gets
 * the next one and counts as a step forward.
 */
function adopt(): void {
  depth += 1
  history.replaceState({ ...history.state, d: depth }, "")
}

let installed = false

/**
 * Deferred rather than run on import: this module is also loaded by tests,
 * which run without a DOM, and everything above this point is pure. Idempotent,
 * and never torn down — the listeners live as long as the app does.
 */
function install(): void {
  if (installed) return
  installed = true

  const entry = depthOf(history.state)
  if (entry === null) adopt()
  else depth = entry

  window.addEventListener("popstate", () => {
    const next = depthOf(history.state)
    if (next === null) {
      // Back or Forward onto an entry from before this module was installed.
      direction = "pop"
      adopt()
    } else {
      direction = directionOf(depth, next)
      depth = next
    }
    emit()
  })

  window.addEventListener("hashchange", () => {
    // Two different events arrive here. `pushState` raises none, so a hash we
    // set ourselves never reaches this. But traversing *between* two entries
    // that differ only in their fragment — which, in a hash-routed app, is
    // every Back and Forward — raises `hashchange` right after `popstate`. That
    // one is an echo of a move already accounted for, and treating it as a
    // fresh arrival overwrote every "pop" with "push", so Back animated as if
    // it were opening something new.
    //
    // A stamped entry is one of ours and has already been handled. Only an
    // unstamped one is genuinely new: a hash typed into the address bar, or an
    // anchor followed.
    if (depthOf(history.state) !== null) return
    adopt()
    direction = "push"
    emit()
  })
}

/**
 * Go to a route. `replace` swaps the current history entry instead of pushing a
 * new one — used when a route is corrected rather than navigated to, so Back
 * doesn't land on the bad URL again.
 */
export function navigate(
  route: Route,
  {
    replace = false,
    via,
    from,
  }: { replace?: boolean; via?: "appeal"; from?: string } = {},
): void {
  install()
  const hash = routeToHash(route)
  const sameEntry = hash === window.location.hash
  if (sameEntry && !via && !from) return
  // A repeat navigation to the same destination can still carry new context —
  // the vacancy that is already open, reopened from a thread. Rewrite the
  // current entry rather than pushing a duplicate of it.
  if (sameEntry) replace = true

  const url = `${window.location.pathname}${window.location.search}${hash}`
  if (replace) {
    direction = "replace"
    const next: NavState = { ...(history.state as object), d: depth }
    if (via) next.via = via
    else delete next.via
    if (from) next.from = from
    else delete next.from
    history.replaceState(next, "", url)
  } else {
    depth += 1
    direction = "push"
    history.pushState(
      { d: depth, ...(via ? { via } : {}), ...(from ? { from } : {}) },
      "",
      url,
    )
  }
  emit()
}

/**
 * One step back in the stack this module stamped. A vacancy opened from a
 * thread returns to that thread; one opened from the feed returns to the feed.
 * Direct links have no previous entry of ours, so they fall back to `fallback`
 * instead of leaving the app.
 */
export function back(fallback: Route = { name: "search" }): void {
  install()
  if (depth > 1) {
    history.back()
    return
  }
  navigate(fallback)
}

function subscribe(onChange: () => void) {
  install()
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

/** Current route, re-rendering on every navigation (including Back/Forward). */
export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parseRoute(hash)
}

/**
 * Which way the current route was reached. Read alongside {@link useRoute}: the
 * value only means anything in the render that the route changed in.
 */
export function useNavDirection(): NavDirection {
  return useSyncExternalStore(subscribe, () => direction)
}

/** How the current entry was opened — an appeal vacancy vs the search feed. */
export function useNavVia(): "appeal" | undefined {
  return useSyncExternalStore(subscribe, () => {
    const via = (history.state as NavState | null)?.via
    return via === "appeal" ? "appeal" : undefined
  })
}

/**
 * The thread a via-appeal vacancy was opened from. The job URL does not name
 * it, so the stack that keeps the chat mounted underneath reads it here.
 */
export function useNavFrom(): string | undefined {
  return useSyncExternalStore(subscribe, () => {
    const from = (history.state as NavState | null)?.from
    return typeof from === "string" ? from : undefined
  })
}

/** Stable `navigate` for components that only need to trigger navigation. */
export function useNavigate() {
  return useCallback(
    (
      route: Route,
      opts?: { replace?: boolean; via?: "appeal"; from?: string },
    ) => navigate(route, opts),
    [],
  )
}
