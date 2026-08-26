import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { SnackbarProvider } from "@/shared/ui/Snackbar"
import { SavedProvider, useSaved } from "./store"

function wrap(initialSaved: string[] = []) {
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <SnackbarProvider>
        <SavedProvider initialSaved={initialSaved}>{children}</SavedProvider>
      </SnackbarProvider>
    )
  }
}

function statusText() {
  return document.querySelector('[role="status"]')?.textContent ?? ""
}

describe("saved vacancies snackbar", () => {
  it("announces a save", () => {
    const { result } = renderHook(() => useSaved(), { wrapper: wrap() })
    act(() => result.current.toggleSaved("job-1"))
    expect(statusText()).toContain("Вакансия добавлена в избранное")
  })

  it("announces an unsave", () => {
    const { result } = renderHook(() => useSaved(), {
      wrapper: wrap(["job-1"]),
    })
    act(() => result.current.toggleSaved("job-1"))
    expect(statusText()).toContain("Вакансия удалена из избранного")
  })
})
