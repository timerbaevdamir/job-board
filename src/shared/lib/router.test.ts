import { describe, expect, it } from "vitest"
import {
  activeSection,
  directionOf,
  parseRoute,
  routeToHash,
  type Route,
} from "./router"

describe("parseRoute", () => {
  it("treats an empty hash and an explicit one alike", () => {
    expect(parseRoute("")).toEqual({ name: "search" })
    expect(parseRoute("#")).toEqual({ name: "search" })
    expect(parseRoute("#/")).toEqual({ name: "search" })
    expect(parseRoute("#/search")).toEqual({ name: "search" })
  })

  it("reads a vacancy id", () => {
    expect(parseRoute("#/job/j-7")).toEqual({ name: "job", jobId: "j-7" })
  })

  it("falls back to the feed when the id is missing", () => {
    expect(parseRoute("#/job")).toEqual({ name: "search" })
  })

  it("reads appeals with and without a thread", () => {
    expect(parseRoute("#/appeals")).toEqual({
      name: "appeals",
      appealId: undefined,
    })
    expect(parseRoute("#/appeals/a-4")).toEqual({
      name: "appeals",
      appealId: "a-4",
    })
  })

  it("keeps unknown sections as sections rather than erroring", () => {
    expect(parseRoute("#/saved")).toEqual({ name: "section", section: "saved" })
  })

  it("recognises the component gallery", () => {
    expect(parseRoute("#/dev")).toEqual({ name: "dev" })
  })

  it("tolerates redundant slashes", () => {
    expect(parseRoute("#//job//j-3//")).toEqual({ name: "job", jobId: "j-3" })
  })
})

describe("routeToHash", () => {
  const routes: Route[] = [
    { name: "search" },
    { name: "job", jobId: "j-1" },
    { name: "appeals" },
    { name: "appeals", appealId: "a-2" },
    { name: "section", section: "profile" },
    { name: "dev" },
  ]

  it("round-trips through parseRoute", () => {
    for (const route of routes) {
      expect(parseRoute(routeToHash(route))).toEqual(
        // `#/appeals` parses back with an explicit undefined thread.
        route.name === "appeals" && route.appealId === undefined
          ? { name: "appeals", appealId: undefined }
          : route,
      )
    }
  })
})

describe("activeSection", () => {
  it("keeps an open vacancy under Поиск", () => {
    expect(activeSection({ name: "job", jobId: "j-1" })).toBe("search")
    expect(activeSection({ name: "search" })).toBe("search")
  })

  it("maps the rest to their own nav item", () => {
    expect(activeSection({ name: "appeals", appealId: "a-1" })).toBe("appeals")
    expect(activeSection({ name: "section", section: "saved" })).toBe("saved")
    // The gallery is outside the nav entirely.
    expect(activeSection({ name: "dev" })).toBe("")
  })
})

describe("directionOf", () => {
  it("reads a deeper entry as a push and a shallower one as a pop", () => {
    expect(directionOf(0, 1)).toBe("push")
    expect(directionOf(3, 2)).toBe("pop")
  })

  it("reads the same depth as a replace — the entry was corrected, not left", () => {
    expect(directionOf(2, 2)).toBe("replace")
  })

  it("reads a jump of several entries by its sign, not its size", () => {
    // Back through a whole stack at once (a long-press on Back) is still a pop.
    expect(directionOf(5, 0)).toBe("pop")
    expect(directionOf(0, 5)).toBe("push")
  })
})
