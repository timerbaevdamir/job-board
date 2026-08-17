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

    // 64rem = 1024px, the `lg:` boundary.
    resizeTo(1023)
    expect(result.current).toBe("tablet")
    resizeTo(1024)
    expect(result.current).toBe("desktop")
  })

  it("reads the mode during render, not after an effect", () => {
    // `useSyncExternalStore` rather than state-plus-effect: a first paint in the
    // wrong mode would render a bottom bar on a desktop and then swap it.
    resizeTo(1280)
    const { result } = renderHook(() => useLayoutMode())
    expect(result.current).toBe("desktop")
  })
})
