import { describe, expect, it } from "vitest"
import { matchSuggestions } from "./matchSuggestions"

const POOL = [
  "Senior Product Designer",
  "Продуктовый дизайнер",
  "Продуктовый аналитик",
  "Дизайн-лид мобильного направления",
  "Яндекс",
]

describe("matchSuggestions", () => {
  it("suggests nothing for an empty or blank query", () => {
    expect(matchSuggestions(POOL, "")).toEqual([])
    expect(matchSuggestions(POOL, "   ")).toEqual([])
  })

  it("matches on a substring, case-insensitively", () => {
    expect(matchSuggestions(POOL, "дизайн")).toContain("Продуктовый дизайнер")
    expect(matchSuggestions(POOL, "ЯНД")).toContain("Яндекс")
    expect(matchSuggestions(POOL, "PRODUCT")).toContain(
      "Senior Product Designer",
    )
  })

  it("excludes the exact phrase already typed", () => {
    // Offering back what the user just finished typing is noise — and this
    // holds regardless of case, since the comparison is lowercased.
    expect(matchSuggestions(POOL, "Яндекс")).not.toContain("Яндекс")
    expect(matchSuggestions(POOL, "ЯНДЕКС")).not.toContain("Яндекс")
  })

  it("falls back to word tokens so a full phrase still surfaces relatives", () => {
    const out = matchSuggestions(POOL, "продуктовый дизайнер")
    // The phrase itself drops out as an exact match…
    expect(out).not.toContain("Продуктовый дизайнер")
    // …but a neighbour sharing the "продуктовый" token stays.
    expect(out).toContain("Продуктовый аналитик")
  })

  it("requires ≥2 characters for a token, but not for the whole phrase", () => {
    // "лид" is a token of the query and matches "Дизайн-лид…"; a one-letter
    // token would match nearly everything, so tokens below two are dropped.
    expect(matchSuggestions(POOL, "лид я")).toContain(
      "Дизайн-лид мобильного направления",
    )
    expect(matchSuggestions(POOL, "лид я")).not.toContain("Яндекс")
    // The whole-phrase rule has no such floor: one letter still narrows.
    expect(matchSuggestions(POOL, "я").length).toBeGreaterThan(0)
  })

  it("respects the limit", () => {
    expect(matchSuggestions(POOL, "и", 2)).toHaveLength(2)
    expect(matchSuggestions(POOL, "и", 1)).toHaveLength(1)
  })
})
