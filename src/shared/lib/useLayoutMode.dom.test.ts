import { describe, expect, it } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useLayoutMode } from "./useLayoutMode"

/** Resize the window the way a browser would: set it, then announce it. */
function resizeTo(width: number) {
  act(() => {
    window.innerWidth = width
    window.dispatchEvent(new Event("resize"))
  })
}

describe("useLayoutMode", () => {
  it("names the three layouts by the breakpoints the stylesheet declares", () => {
    resizeTo(390)
    const { result } = renderHook(() => useLayoutMode())
    expect(result.current).toBe("mobile")

    // 48rem = 768px, the `md:` boundary.
    resizeTo(767)
    expect(result.current).toBe("mobile")
    resizeTo(768)
    expect(result.current).toBe("tablet")

    // 80rem = 1280px, the `xl:` boundary — not `lg:`. An expanded rail plus
    // the feed still cannot share 1024 comfortably, so the mode stays tablet
    // (collapsed rail) through that range. Discovery sits in the feed here
    // and only becomes its own column on desktop.
    resizeTo(1279)
    expect(result.current).toBe("tablet")
    resizeTo(1280)
    expect(result.current).toBe("desktop")
  })

  it("keeps the rail collapsed across the range the discovery column shares", () => {
    resizeTo(1024)
    const { result } = renderHook(() => useLayoutMode())
    // Expanded labels still do not fit beside the feed until `xl`, so the
    // rail stays collapsed through this range even though CSS `lg` has fired.
    for (const width of [1024, 1100, 1200, 1279]) {
      resizeTo(width)
      expect(result.current).toBe("tablet")
    }
  })

  it("reads the mode during render, not after an effect", () => {
    // `useSyncExternalStore` rather than state-plus-effect: a first paint in the
    // wrong mode would render a bottom bar on a desktop and then swap it.
    resizeTo(1440)
    const { result } = renderHook(() => useLayoutMode())
    expect(result.current).toBe("desktop")
  })
})
