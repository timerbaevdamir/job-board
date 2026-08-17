import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type { ReactNode } from "react"

/**
 * The search session: what every part of the screen reads to agree on one
 * picture. Its rules live in effects and callbacks rather than in a function
 * that can be called, so none of it was reachable before there was a DOM.
 *
 * The request is replaced with one the test resolves by hand. Nothing else is
 * mocked — the filter config, the history and the counting are the real ones.
 * That is the point of the substitution: it is the *timing* of a response that
 * these cases are about, and the real one arrives after a random delay.
 */
const { pending } = vi.hoisted(() => ({
  pending: [] as {
    query: string
    resolve: (result: { items: never[]; total: number }) => void
  }[],
}))

vi.mock("@/entities/job", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/entities/job")>()),
  searchJobs: ({ query }: { query: string }) =>
    new Promise((resolve) => {
      pending.push({ query, resolve })
    }),
}))

const { SearchProvider, useSearch } = await import("./store")

const wrapper = ({ children }: { children: ReactNode }) => (
  <SearchProvider>{children}</SearchProvider>
)

const mount = () => renderHook(() => useSearch(), { wrapper })

/** Answer one in-flight request, identifying it by the total it returns. */
const respond = async (index: number, total: number) => {
  await act(async () => {
    pending[index].resolve({ items: [], total })
  })
}

describe("search session", () => {
  beforeEach(() => {
    pending.length = 0
  })

  it("runs a request on mount and reports it as loading until it lands", async () => {
    const { result } = mount()
    expect(pending).toHaveLength(1)
    expect(result.current.loading).toBe(true)

    await respond(0, 12)
    expect(result.current.loading).toBe(false)
    expect(result.current.total).toBe(12)
  })

  it("discards a response overtaken by a newer one", async () => {
    const { result } = mount()
    act(() => result.current.setQuery("дизайнер"))
    expect(pending.map((p) => p.query)).toEqual(["", "дизайнер"])

    // The second request comes back first — the fast one for the query the user
    // actually typed — and only then the slow one for what they had typed
    // before. Without the request-id guard the stale answer lands last and
    // wins, leaving the feed showing results for a query that is no longer in
    // the field.
    await respond(1, 3)
    await respond(0, 99)

    expect(result.current.total).toBe(3)
  })

  it("bumps searchId once per landed search, not per parameter change", async () => {
    const { result } = mount()
    await respond(0, 1)
    const first = result.current.searchId

    act(() => result.current.setSort("date"))
    expect(result.current.searchId).toBe(first)

    await respond(1, 1)
    expect(result.current.searchId).toBe(first + 1)
  })

  it("adds and removes options within a multi filter", () => {
    const { result } = mount()

    act(() => result.current.toggleFilterOption("schedule", "remote", true))
    act(() => result.current.toggleFilterOption("schedule", "flexible", true))
    expect(result.current.filters.schedule).toEqual(["remote", "flexible"])

    act(() => result.current.toggleFilterOption("schedule", "remote", true))
    expect(result.current.filters.schedule).toEqual(["flexible"])
  })

  it("replaces the choice in a single-select filter, and clears it when re-picked", () => {
    const { result } = mount()

    act(() => result.current.toggleFilterOption("experience", "1-3", false))
    expect(result.current.filters.experience).toEqual(["1-3"])

    act(() => result.current.toggleFilterOption("experience", "3-6", false))
    expect(result.current.filters.experience).toEqual(["3-6"])

    // Picking the chosen one again is how a radio group is un-set — there is no
    // other control for it.
    act(() => result.current.toggleFilterOption("experience", "3-6", false))
    expect(result.current.filters.experience).toEqual([])
  })

  it("counts filters that have a choice, not choices", () => {
    const { result } = mount()

    act(() => result.current.toggleFilterOption("schedule", "remote", true))
    act(() => result.current.toggleFilterOption("schedule", "flexible", true))
    expect(result.current.activeFilterCount).toBe(1)

    act(() => result.current.toggleFilterOption("experience", "1-3", false))
    expect(result.current.activeFilterCount).toBe(2)

    // Emptied, not removed — the key stays behind and must not still count.
    act(() => result.current.clearFilter("schedule"))
    expect(result.current.activeFilterCount).toBe(1)
  })

  it("drops every filter at once but leaves the query alone", () => {
    const { result } = mount()

    act(() => result.current.setQuery("аналитик"))
    act(() => result.current.toggleFilterOption("schedule", "remote", true))
    act(() => result.current.toggleFilterOption("experience", "1-3", false))

    act(() => result.current.resetFilters())
    expect(result.current.activeFilterCount).toBe(0)
    expect(result.current.query).toBe("аналитик")
  })

  it("records committed queries in history, most recent first", () => {
    const { result } = mount()

    act(() => result.current.setQuery("аналитик"))
    act(() => result.current.setQuery("дизайнер"))
    expect(result.current.history.slice(0, 2)).toEqual(["дизайнер", "аналитик"])

    act(() => result.current.removeFromHistory("дизайнер"))
    expect(result.current.history).not.toContain("дизайнер")
  })
})
