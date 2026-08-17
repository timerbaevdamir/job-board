import { describe, expect, it } from "vitest"
import { CHIP_FILTERS, FILTERS } from "@/shared/config/filters"
import { orderFilters } from "./orderFilters"

const ids = (fs: { id: string }[]) => fs.map((f) => f.id)

describe("orderFilters", () => {
  it("keeps the catalog order when nothing is applied", () => {
    expect(ids(orderFilters(CHIP_FILTERS, {}))).toEqual(ids(CHIP_FILTERS))
  })

  it("floats applied filters to the front", () => {
    const out = ids(orderFilters(CHIP_FILTERS, { employment: ["full"] }))
    expect(out[0]).toBe("employment")
  })

  it("preserves catalog order within each group", () => {
    const out = ids(
      orderFilters(CHIP_FILTERS, { employment: ["full"], income: ["80"] }),
    )
    // Both applied — among themselves they keep the catalog's sequence.
    expect(out.slice(0, 2)).toEqual(["income", "employment"])
    const rest = out.slice(2)
    const catalogRest = ids(CHIP_FILTERS).filter((id) => rest.includes(id))
    expect(rest).toEqual(catalogRest)
  })

  it("treats an empty option list as not applied", () => {
    expect(ids(orderFilters(CHIP_FILTERS, { employment: [] }))).toEqual(
      ids(CHIP_FILTERS),
    )
  })

  it("does not mutate the catalog it is given", () => {
    const before = ids(FILTERS)
    orderFilters(FILTERS, { extras: ["verified"] })
    expect(ids(FILTERS)).toEqual(before)
  })
})
