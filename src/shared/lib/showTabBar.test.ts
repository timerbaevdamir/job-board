import { describe, expect, it } from "vitest"
import { showTabBar } from "./showTabBar"

describe("showTabBar", () => {
  it("is the phone bar: list, search, and a vacancy opened from search", () => {
    expect(showTabBar("mobile", { name: "search" })).toBe(true)
    expect(showTabBar("mobile", { name: "appeals" })).toBe(true)
    expect(showTabBar("mobile", { name: "job", jobId: "j-1" })).toBe(true)
    expect(showTabBar("mobile", { name: "section", section: "saved" })).toBe(
      true,
    )
  })

  it("hides on a phone thread and on a vacancy opened from one", () => {
    expect(
      showTabBar("mobile", { name: "appeals", appealId: "a-1" }),
    ).toBe(false)
    expect(
      showTabBar("mobile", { name: "job", jobId: "j-1" }, "appeal"),
    ).toBe(false)
  })

  it("is never the tablet or desktop rail", () => {
    expect(showTabBar("tablet", { name: "search" })).toBe(false)
    expect(showTabBar("desktop", { name: "search" })).toBe(false)
    expect(
      showTabBar("desktop", { name: "appeals", appealId: "a-1" }),
    ).toBe(false)
  })
})
