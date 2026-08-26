import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { SnackbarProvider, useSnackbar } from "./Snackbar"

const wrapper = ({ children }: { children: ReactNode }) => (
  <SnackbarProvider>{children}</SnackbarProvider>
)

function status() {
  return document.querySelector('[role="status"]')
}

describe("snackbar host", () => {
  it("renders the title in a live region", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper })
    act(() => result.current.show({ title: "Вы подписались на поиск" }))
    expect(status()?.textContent).toContain("Вы подписались на поиск")
  })

  it("replaces the previous toast when another is shown", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper })
    act(() => result.current.show({ title: "Первый" }))
    act(() => result.current.show({ title: "Второй" }))
    expect(status()?.textContent).toContain("Второй")
    expect(status()?.textContent).not.toContain("Первый")
  })

  it("keeps subtitle and trailing in the same card as the title", () => {
    const { result } = renderHook(() => useSnackbar(), { wrapper })
    act(() =>
      result.current.show({
        title: "Отклик отправлен",
        subtitle: "Ещё 9 откликов до дневной цели",
        trailing: "1/10",
      }),
    )
    const text = status()?.textContent ?? ""
    expect(text).toContain("Отклик отправлен")
    expect(text).toContain("Ещё 9 откликов до дневной цели")
    expect(text).toContain("1/10")
  })
})
