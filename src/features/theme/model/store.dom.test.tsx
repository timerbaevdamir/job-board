import { beforeEach, describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { ThemeProvider, useTheme } from "./store"

function wrap({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

function isDark(): boolean {
  return document.documentElement.classList.contains("dark")
}

// The store persists into the same document it styles, so each test starts
// from a genuinely clean slate.
beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove("dark")
})

describe("theme", () => {
  it("defaults to light when neither a stored choice nor a system preference exists", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrap })
    expect(result.current.theme).toBe("light")
    expect(isDark()).toBe(false)
  })

  it("toggles the class on the root element and back", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrap })
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe("dark")
    expect(isDark()).toBe(true)
    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe("light")
    expect(isDark()).toBe(false)
  })

  it("persists the choice for the next session", () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrap })
    act(() => result.current.toggleTheme())
    expect(window.localStorage.getItem("job-board-theme")).toBe("dark")
  })

  it("restores the stored choice on start", () => {
    window.localStorage.setItem("job-board-theme", "dark")
    const { result } = renderHook(() => useTheme(), { wrapper: wrap })
    expect(result.current.theme).toBe("dark")
    expect(isDark()).toBe(true)
  })
})
