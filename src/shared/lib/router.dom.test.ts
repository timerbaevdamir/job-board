import { describe, expect, it, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { navigate, useNavDirection, useRoute } from "./router"

/**
 * The half of the router that a pure test cannot reach: the history stack.
 *
 * `directionOf` is covered next door, but the interesting part is not the
 * comparison — it is whether the depths being compared are the ones the browser
 * actually walked. Every entry has to be stamped on the way out and read back
 * on the way in, through `pushState`, which raises no event of its own, and
 * through `popstate`, which raises one but says nothing about which way it went.
 */

/** Back and forward are queued, not synchronous — wait for the event. */
function pop(step: number) {
  return act(
    () =>
      new Promise<void>((resolve) => {
        window.addEventListener("popstate", () => resolve(), { once: true })
        history.go(step)
      }),
  )
}

function mount() {
  return renderHook(() => ({
    route: useRoute(),
    direction: useNavDirection(),
  }))
}

describe("router history", () => {
  beforeEach(() => {
    // Reset through the router rather than by hand. A raw
    // `replaceState(null, …)` strips the entry's depth, and an unstamped entry
    // is adopted as the *newest* one — which is true of every way the app can
    // really produce one, and false of an entry conjured behind others here.
    navigate({ name: "search" }, { replace: true })
  })

  it("reports a push, then the pop that undoes it", async () => {
    const { result } = mount()

    act(() => navigate({ name: "job", jobId: "j-7" }))
    expect(result.current.route).toEqual({ name: "job", jobId: "j-7" })
    expect(result.current.direction).toBe("push")

    await pop(-1)
    expect(result.current.route).toEqual({ name: "search" })
    expect(result.current.direction).toBe("pop")
  })

  it("reports going forward again as a push", async () => {
    const { result } = mount()

    act(() => navigate({ name: "job", jobId: "j-7" }))
    await pop(-1)
    await pop(1)

    expect(result.current.route).toEqual({ name: "job", jobId: "j-7" })
    expect(result.current.direction).toBe("push")
  })

  it("does not deepen the stack on replace", async () => {
    const { result } = mount()

    act(() => navigate({ name: "job", jobId: "j-7" }))
    act(() => navigate({ name: "search" }, { replace: true }))
    expect(result.current.direction).toBe("replace")

    // The corrected entry took the place of the bad one, so one step back is
    // the feed we started on and not the vacancy that was rewritten away.
    await pop(-1)
    expect(result.current.route).toEqual({ name: "search" })
    expect(result.current.direction).toBe("pop")
  })

  it("ignores a navigation to where we already are", () => {
    const { result } = mount()

    act(() => navigate({ name: "job", jobId: "j-7" }))
    const before = history.length
    act(() => navigate({ name: "job", jobId: "j-7" }))

    expect(history.length).toBe(before)
    expect(result.current.route).toEqual({ name: "job", jobId: "j-7" })
  })

  it("keeps depth across several levels", async () => {
    const { result } = mount()

    act(() => navigate({ name: "job", jobId: "a" }))
    act(() => navigate({ name: "job", jobId: "b" }))
    act(() => navigate({ name: "appeals", appealId: "c" }))

    // Straight back through the whole stack at once: still one pop, however
    // many entries it crossed.
    await pop(-3)
    expect(result.current.direction).toBe("pop")
    expect(result.current.route).toEqual({ name: "search" })
  })

  it("back returns to the previous route", async () => {
    const { result } = mount()

    act(() => navigate({ name: "appeals", appealId: "a-1" }))
    act(() => navigate({ name: "job", jobId: "j-1" }, { via: "appeal" }))
    expect(result.current.route).toEqual({ name: "job", jobId: "j-1" })

    await pop(-1)

    expect(result.current.route).toEqual({
      name: "appeals",
      appealId: "a-1",
    })
    expect(result.current.direction).toBe("pop")
  })
})
