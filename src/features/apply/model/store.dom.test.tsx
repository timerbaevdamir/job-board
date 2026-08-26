import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { SnackbarProvider } from "@/shared/ui/Snackbar"
import { ApplicationsProvider, useApplications } from "./store"

const wrapper = ({ children }: { children: ReactNode }) => (
  <SnackbarProvider>
    <ApplicationsProvider>{children}</ApplicationsProvider>
  </SnackbarProvider>
)

function statusText() {
  return document.querySelector('[role="status"]')?.textContent ?? ""
}

describe("application snackbar", () => {
  it("announces a new application with the daily-goal copy", () => {
    const { result } = renderHook(() => useApplications(), { wrapper })
    act(() => result.current.apply("job-1"))
    const text = statusText()
    expect(text).toContain("Отклик отправлен")
    expect(text).toContain("Ещё 9 откликов до дневной цели")
    expect(text).toContain("1/10")
  })

  it("does not toast again for a vacancy already applied to", () => {
    const { result } = renderHook(() => useApplications(), { wrapper })
    act(() => result.current.apply("job-1"))
    act(() => result.current.apply("job-1"))
    expect(statusText()).toContain("1/10")
    expect(result.current.isApplied("job-1")).toBe(true)
  })
})
