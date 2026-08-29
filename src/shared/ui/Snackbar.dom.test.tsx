import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { navigate } from "@/shared/lib/router"
import { SnackbarProvider, useSnackbar } from "./Snackbar"

const wrapper = ({ children }: { children: ReactNode }) => (
  <SnackbarProvider>{children}</SnackbarProvider>
)

function status() {
  return document.querySelector('[role="status"]')
}

function resizeTo(width: number) {
  act(() => {
    window.innerWidth = width
    window.dispatchEvent(new Event("resize"))
  })
}

function showTitle(title: string) {
  const { result } = renderHook(() => useSnackbar(), { wrapper })
  act(() => result.current.show({ title }))
  return status()
}

const ABOVE_TAB =
  "bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]"
const ABOVE_HOME =
  "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"

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

  it("sits above the tab bar on a phone feed", () => {
    resizeTo(390)
    act(() => navigate({ name: "search" }, { replace: true }))
    const className = showTitle("Сохранено")?.className ?? ""
    expect(className).toContain(ABOVE_TAB)
    expect(className).not.toContain(ABOVE_HOME)
  })

  it("keeps the tab-bar inset on a vacancy opened from search", () => {
    resizeTo(390)
    act(() => navigate({ name: "job", jobId: "j-1" }, { replace: true }))
    const className = showTitle("Сохранено")?.className ?? ""
    expect(className).toContain(ABOVE_TAB)
    expect(className).not.toContain(ABOVE_HOME)
  })

  it("drops the tab-bar inset when the bar is hidden", () => {
    resizeTo(390)
    act(() =>
      navigate({ name: "job", jobId: "j-1" }, { replace: true, via: "appeal" }),
    )
    const className = showTitle("Вакансия удалена из избранного")?.className ?? ""
    expect(className).toContain(ABOVE_HOME)
    expect(className).not.toContain(ABOVE_TAB)
  })

  it("drops the tab-bar inset inside a chat thread", () => {
    resizeTo(390)
    act(() =>
      navigate({ name: "appeals", appealId: "a-1" }, { replace: true }),
    )
    const className = showTitle("Сохранено")?.className ?? ""
    expect(className).toContain(ABOVE_HOME)
    expect(className).not.toContain(ABOVE_TAB)
  })

  it("does not reserve a phone tab bar on tablet or desktop", () => {
    resizeTo(1024)
    act(() => navigate({ name: "search" }, { replace: true }))
    const className = showTitle("Сохранено")?.className ?? ""
    expect(className).toContain("bottom-6")
    expect(className).not.toContain(ABOVE_TAB)
  })
})
