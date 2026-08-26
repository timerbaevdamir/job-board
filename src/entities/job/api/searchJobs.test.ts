import { describe, expect, it } from "vitest"
import { FILTERS, type FilterSelection } from "@/shared/config/filters"
import { JOBS } from "./mock"
import {
  ANY_CITY,
  CITIES,
  POPULAR_CITIES,
  countOptions,
  selectJobs,
  type SearchParams,
} from "./searchJobs"

/** Baseline params — override just the axis under test. */
const params = (over: Partial<SearchParams> = {}): SearchParams => ({
  query: "",
  city: ANY_CITY,
  filters: {},
  sort: "match",
  ...over,
})

const idsOf = (p: SearchParams) => selectJobs(p).items.map((j) => j.id)

describe("query", () => {
  it("returns everything when empty", () => {
    expect(selectJobs(params()).total).toBe(JOBS.length)
  })

  it("matches title, company, location and tags", () => {
    expect(idsOf(params({ query: "Продуктовый аналитик" }))).toContain("j-9")
    expect(idsOf(params({ query: "Тинькофф" }))).toContain("j-5")
    expect(idsOf(params({ query: "Санкт-Петербург" })).length).toBeGreaterThan(
      0,
    )
    expect(idsOf(params({ query: "SQL" }))).toContain("j-9")
  })

  it("ignores case and surrounding spaces", () => {
    expect(idsOf(params({ query: "  ТИНЬКОФФ " }))).toEqual(
      idsOf(params({ query: "тинькофф" })),
    )
  })
})

describe("city", () => {
  it("keeps the city's own vacancies and every remote one", () => {
    const items = selectJobs(params({ city: "Санкт-Петербург" })).items
    expect(items.length).toBeGreaterThan(0)
    for (const job of items) {
      expect(
        job.location === "Санкт-Петербург" || job.workMode === "Remote",
      ).toBe(true)
    }
    // A Moscow-only vacancy must not leak into a Petersburg search.
    expect(items.map((j) => j.id)).not.toContain("j-2")
  })

  it("does not restrict on the sentinel", () => {
    expect(selectJobs(params({ city: ANY_CITY })).total).toBe(JOBS.length)
  })
})

describe("filters", () => {
  it("ANDs across different filters", () => {
    const spb = new Set(idsOf(params({ filters: { format: ["office"] } })))
    const full = new Set(idsOf(params({ filters: { employment: ["full"] } })))
    const both = idsOf(
      params({ filters: { format: ["office"], employment: ["full"] } }),
    )
    for (const id of both) {
      expect(spb.has(id) && full.has(id)).toBe(true)
    }
  })

  it("ORs inside a plain multi filter — more options, more results", () => {
    const one = selectJobs(params({ filters: { format: ["remote"] } })).total
    const two = selectJobs(
      params({ filters: { format: ["remote", "office"] } }),
    ).total
    expect(two).toBeGreaterThan(one)
  })

  it('ANDs inside a filter declared combine:"all"', () => {
    // "extras" is the one group where each tick is another requirement.
    const withSalary = selectJobs(
      params({ filters: { extras: ["with-salary"] } }),
    ).total
    const both = selectJobs(
      params({ filters: { extras: ["with-salary", "verified"] } }),
    ).total
    expect(both).toBeLessThanOrEqual(withSalary)

    for (const job of selectJobs(
      params({ filters: { extras: ["with-salary", "verified"] } }),
    ).items) {
      expect(job.salaryFrom).toBeDefined()
      expect(job.verified).toBe(true)
    }
  })

  it("treats undisclosed pay as failing a salary floor", () => {
    const items = selectJobs(params({ filters: { income: ["80"] } })).items
    expect(items.every((j) => j.salaryFrom !== undefined)).toBe(true)
    // j-2 has no salary at all, so no floor can admit it.
    expect(items.map((j) => j.id)).not.toContain("j-2")
  })

  it("matches an experience band by overlap, not by containment", () => {
    // j-7 asks for 5+ years and has no upper bound: it belongs to both the
    // "3–6" band and the "6+" one.
    expect(idsOf(params({ filters: { experience: ["3-6"] } }))).toContain("j-7")
    expect(idsOf(params({ filters: { experience: ["6"] } }))).toContain("j-7")
  })

  it("bounds recency by posting age", () => {
    for (const job of selectJobs(params({ filters: { recency: ["today"] } }))
      .items) {
      expect(job.postedHoursAgo).toBeLessThanOrEqual(24)
    }
    expect(selectJobs(params({ filters: { recency: ["all"] } })).total).toBe(
      JOBS.length,
    )
  })

  it("an empty option list is not a filter", () => {
    expect(selectJobs(params({ filters: { format: [] } })).total).toBe(
      JOBS.length,
    )
  })
})

describe("sorting", () => {
  it("orders by match, then date, then salary — descending where it should", () => {
    const match = selectJobs(params({ sort: "match" })).items
    const date = selectJobs(params({ sort: "date" })).items
    const salary = selectJobs(params({ sort: "salary" })).items

    const nonIncreasing = (xs: number[]) =>
      xs.every((v, i) => i === 0 || xs[i - 1] >= v)

    expect(nonIncreasing(match.map((j) => j.matchPercent ?? -1))).toBe(true)
    expect(nonIncreasing(salary.map((j) => j.salaryFrom ?? -1))).toBe(true)
    // Freshest first.
    const ages = date.map((j) => j.postedHoursAgo)
    expect(ages.every((v, i) => i === 0 || ages[i - 1] <= v)).toBe(true)
  })

  it("sinks missing values to the bottom rather than dropping them", () => {
    const items = selectJobs(params({ sort: "salary" })).items
    expect(items.length).toBe(JOBS.length)
    expect(items.at(-1)?.salaryFrom).toBeUndefined()
  })
})

describe("countOptions", () => {
  const ids = (filterId: string) =>
    FILTERS.find((f) => f.id === filterId)!.options.map((o) => o.id)

  it("counts what each option would yield, not what is selected", () => {
    // Counting a filter ignores that filter's own selection — otherwise every
    // unpicked option in a single-select would read 0.
    const clean = countOptions(params(), "employment", ids("employment"))
    const withOwn = countOptions(
      params({ filters: { employment: ["intern"] } }),
      "employment",
      ids("employment"),
    )
    expect(withOwn).toEqual(clean)
  })

  it("still respects the other active filters and the query", () => {
    const clean = countOptions(params(), "employment", ids("employment"))
    const narrowed = countOptions(
      params({ filters: { format: ["remote"] } }),
      "employment",
      ids("employment"),
    )
    expect(narrowed.full).toBeLessThan(clean.full)
  })

  it("agrees with the search it predicts", () => {
    const counts = countOptions(params(), "experience", ids("experience"))
    for (const id of ids("experience")) {
      expect(counts[id]).toBe(
        selectJobs(params({ filters: { experience: [id] } })).total,
      )
    }
  })
})

describe("catalog and data agree", () => {
  it("every option can match something", () => {
    // A filter option that can never return a result is a dead end the user is
    // still invited to click — and its counter promises otherwise. This caught
    // six such options when the structured fields were first added.
    const dead: string[] = []
    for (const filter of FILTERS) {
      for (const option of filter.options) {
        const selection: FilterSelection = { [filter.id]: [option.id] }
        if (selectJobs(params({ filters: selection })).total === 0) {
          dead.push(`${filter.label} → ${option.label}`)
        }
      }
    }
    expect(dead).toEqual([])
  })

  it("every city in the picker returns results", () => {
    for (const job of JOBS) {
      expect(selectJobs(params({ city: job.location })).total).toBeGreaterThan(
        0,
      )
    }
  })
})

describe("cities", () => {
  it("leads with the sentinel, then popular, without duplicates or remote", () => {
    expect(CITIES[0]).toBe(ANY_CITY)
    expect(CITIES.slice(1, 1 + POPULAR_CITIES.length)).toEqual(POPULAR_CITIES)
    expect(new Set(CITIES).size).toBe(CITIES.length)
    expect(CITIES).not.toContain("Удалённо")
  })

  it("keeps every catalog location so a vacancy cannot vanish from the picker", () => {
    for (const job of JOBS) {
      if (job.location === "Удалённо") continue
      expect(CITIES).toContain(job.location)
    }
  })
})
