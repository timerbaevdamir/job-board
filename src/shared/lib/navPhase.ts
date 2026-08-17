import type { NavDirection } from "./router"

/**
 * Where a screen is in its arrival or departure.
 *
 * `idle` and `shown` are rest; `entering` and `leaving` are the two moments an
 * animation is running. `leaving` is the one that earns the type: the overlay
 * has to stay mounted through it even though the route no longer names it.
 */
export type NavPhase = "idle" | "entering" | "shown" | "leaving"

/**
 * The next phase, given the one we are in and what just changed.
 *
 * Split out of the component and kept pure for the usual reason a small state
 * machine gets split out: it has four states and four inputs, most of its
 * branches are the ones nobody exercises by hand — a resize part-way through a
 * slide, a `replace` while a screen is on its way in — and it fails silently.
 * Nothing here renders, so all of that can be checked in a `node` test run
 * without a DOM to stand up.
 */
export function nextPhase(
  current: NavPhase,
  {
    open,
    flipped,
    enabled,
    direction,
  }: {
    /** Whether an overlay is being supplied right now. */
    open: boolean
    /** Whether `open` differs from the previous render. */
    flipped: boolean
    /** Whether the stack animates at all — a phone, and nothing wider. */
    enabled: boolean
    /** How the current route was reached. */
    direction: NavDirection
  },
): NavPhase {
  const settled: NavPhase = open ? "shown" : "idle"

  // Nothing slides off a phone, so the stack is only ever at rest — including
  // when a resize interrupts a slide that had already started, which would
  // otherwise leave an animation belonging to a layout that no longer exists.
  if (!enabled) return settled

  // Only a change in what is being shown starts anything. This is also what
  // keeps a deep link still: an overlay that was there on the very first render
  // has never flipped, so it stays settled instead of animating in to claim a
  // navigation that never happened.
  if (!flipped) return current

  // `replace` corrects the current history entry rather than travelling to a
  // new one. Nothing was navigated to, so nothing should move.
  if (direction === "replace") return settled

  return open ? "entering" : "leaving"
}
