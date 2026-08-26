import { describe, expect, it } from "vitest"
import { JOBS } from "./mock"
import { jobMatchesFeed } from "./feeds"

const ids = (feed: Parameters<typeof jobMatchesFeed>[1]) =>
  JOBS.filter((j) => jobMatchesFeed(j, feed)).map((j) => j.id)

describe("jobMatchesFeed", () => {
  it("keeps every vacancy on the general feed", () => {
    expect(ids("for-you")).toEqual(JOBS.map((j) => j.id))
  })

  it("cuts role feeds by title and tags, not the English word product", () => {
    expect(ids("design")).toContain("j-2")
    expect(ids("design")).not.toContain("j-4")
    expect(ids("product")).toContain("j-4")
    expect(ids("product")).not.toContain("j-1")
    expect(ids("analytics")).toEqual(["j-9"])
    expect(ids("dev")).toContain("j-6")
    expect(ids("dev")).not.toContain("j-12")
  })
})
