import { describe, expect, it } from "vitest"
import { nextPhase, type NavPhase } from "./navPhase"

/** Defaults for the common case: a phone, navigating forward. */
const on = (over: Partial<Parameters<typeof nextPhase>[1]> = {}) => ({
  open: true,
  flipped: true,
  enabled: true,
  direction: "push" as const,
  ...over,
})

describe("nextPhase", () => {
  it("slides in when an overlay appears and out when it goes", () => {
    expect(nextPhase("idle", on({ open: true }))).toBe("entering")
    expect(nextPhase("shown", on({ open: false }))).toBe("leaving")
  })

  it("holds still when nothing changed", () => {
    const held: NavPhase[] = ["idle", "entering", "shown", "leaving"]
    for (const phase of held) {
      expect(nextPhase(phase, on({ flipped: false }))).toBe(phase)
    }
  })

  it("leaves a deep-linked overlay settled rather than animating it in", () => {
    // The first render never counts as a flip, so an overlay that was already
    // there is simply shown — animating it would claim a navigation that never
    // happened.
    expect(nextPhase("shown", on({ open: true, flipped: false }))).toBe("shown")
  })

  it("does not animate a replace: the entry was corrected, not travelled to", () => {
    expect(nextPhase("idle", on({ open: true, direction: "replace" }))).toBe(
      "shown",
    )
    expect(nextPhase("shown", on({ open: false, direction: "replace" }))).toBe(
      "idle",
    )
  })

  it("animates a pop the same as a push — the roles are fixed", () => {
    // This stack is one screen deep: the overlay always arrives from the right
    // and always leaves to the right, whichever way history moved.
    expect(nextPhase("idle", on({ open: true, direction: "pop" }))).toBe(
      "entering",
    )
    expect(nextPhase("shown", on({ open: false, direction: "pop" }))).toBe(
      "leaving",
    )
  })

  it("stays settled off a phone, whatever happens", () => {
    expect(nextPhase("idle", on({ enabled: false, open: true }))).toBe("shown")
    expect(nextPhase("shown", on({ enabled: false, open: false }))).toBe("idle")
  })

  it("settles a slide that a resize interrupted", () => {
    // Mid-animation the viewport grows past the phone breakpoint: the phase
    // belongs to a layout that no longer exists and has to be abandoned, even
    // though nothing about the route changed.
    expect(
      nextPhase("entering", on({ enabled: false, open: true, flipped: false })),
    ).toBe("shown")
    expect(
      nextPhase("leaving", on({ enabled: false, open: false, flipped: false })),
    ).toBe("idle")
  })
})
