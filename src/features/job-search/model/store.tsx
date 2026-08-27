import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { searchJobs, ANY_CITY, type Job, type SortId } from "@/entities/job"
import {
  INITIAL_SELECTION,
  type FilterId,
  type FilterSelection,
} from "@/shared/config/filters"
import { useSearchHistory } from "./useSearchHistory"

type SearchContextValue = {
  /** Committed query — what the results actually reflect. */
  query: string
  /** Selected city; `ANY_CITY` means the search isn't restricted by location. */
  city: string
  filters: FilterSelection
  sort: SortId
  /** How many filters have at least one option chosen. */
  activeFilterCount: number

  results: Job[]
  total: number
  /** True while a request is in flight — the feed shows skeletons. */
  loading: boolean
  /**
   * Bumped once per search *started* — not once per search that came back.
   * Effects key off it to react to "we are looking at something else now"
   * (resetting the feed scroll, say) regardless of what triggered it.
   *
   * Start, because that is when the old results stop being the answer. Tying it
   * to the response instead meant the skeletons appeared immediately while the
   * feed stayed parked wherever the reader had scrolled to, and it only jumped
   * to the top half a second later when the data landed — a scroll that looked
   * like the page moving on its own rather than like a new list arriving.
   */
  searchId: number

  setQuery: (value: string) => void
  toggleFilterOption: (
    filterId: FilterId,
    optionId: string,
    multi: boolean,
  ) => void
  clearFilter: (filterId: FilterId) => void
  /** Drops every filter at once — the drawer's «Сбросить». */
  resetFilters: () => void
  setSort: (sort: SortId) => void
  setCity: (city: string) => void
  /**
   * Leave search as a place: empty query, any city, no filters, default sort.
   * The back control uses this so a narrowed feed returns to the home one,
   * rather than dropping only the typed query and staying on city/filters.
   */
  leaveSearch: () => void
  /** True while the session is narrowed — query, city, or a filter. */
  searching: boolean
  /** Recent searches, persisted; surfaced by the field's empty-focus state. */
  history: string[]
  removeFromHistory: (value: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

/**
 * Owns the whole search session: the committed params (query, city, filters,
 * sort), the results they produced, and the in-flight state. Every param change
 * goes through here and re-runs the request, so the feed, the filter bar and
 * the toolbar all read one consistent picture instead of keeping private copies.
 *
 * It is internal to this feature, which is the point. It spent a while on the
 * entity layer instead, because the field and the filters were two slices and
 * neither could hold state the other needed without importing a sibling. That
 * bought a "search entity" that was not an entity — nothing in the domain is a
 * Search — and which had to reach sideways into `job` to run a query. Merging
 * the two slices removed the reason for it to be anywhere else.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState("")
  const [city, setCityState] = useState(ANY_CITY)
  const [filters, setFilters] = useState<FilterSelection>(INITIAL_SELECTION)
  const [sort, setSortState] = useState<SortId>("match")

  const [results, setResults] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchId, setSearchId] = useState(0)

  const { history, record, remove } = useSearchHistory()

  // Run the request on every param change, including the initial mount. Stale
  // responses are discarded by request id, so a fast re-query can't be
  // overwritten by an earlier, slower one still in flight.
  const requestId = useRef(0)
  useEffect(() => {
    const id = ++requestId.current
    // Both of these describe the same moment — a new search is on its way — so
    // they are set together, in the render that shows the skeletons. A reader
    // sees one change: the list they were looking at is replaced.
    setLoading(true)
    setSearchId((n) => n + 1)
    searchJobs({ query, city, filters, sort }).then((res) => {
      if (id !== requestId.current) return
      setResults(res.items)
      setTotal(res.total)
      setLoading(false)
    })
  }, [query, city, filters, sort])

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value)
      record(value)
    },
    [record],
  )

  // Multi: toggle the option within the filter. Single (radio): replace the
  // selection, and re-picking the chosen option clears it.
  const toggleFilterOption = useCallback(
    (filterId: FilterId, optionId: string, multi: boolean) => {
      setFilters((prev) => {
        const current = prev[filterId] ?? []
        const next = multi
          ? current.includes(optionId)
            ? current.filter((x) => x !== optionId)
            : [...current, optionId]
          : current[0] === optionId
            ? []
            : [optionId]
        return { ...prev, [filterId]: next }
      })
    },
    [],
  )

  const clearFilter = useCallback((filterId: FilterId) => {
    setFilters((prev) => ({ ...prev, [filterId]: [] }))
  }, [])

  const resetFilters = useCallback(() => setFilters({}), [])

  const setSort = useCallback((next: SortId) => setSortState(next), [])

  const setCity = useCallback((next: string) => setCityState(next), [])

  const leaveSearch = useCallback(() => {
    setQueryState("")
    setCityState(ANY_CITY)
    setFilters(INITIAL_SELECTION)
    setSortState("match")
  }, [])

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((ids) => ids.length > 0).length,
    [filters],
  )
  const searching =
    query.trim().length > 0 ||
    activeFilterCount > 0 ||
    city !== ANY_CITY

  // Memoized: without it every provider render hands consumers a new object and
  // re-renders the whole feed, filter bar and toolbar regardless of what changed.
  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      city,
      filters,
      sort,
      activeFilterCount,
      results,
      total,
      loading,
      searchId,
      setQuery,
      setCity,
      toggleFilterOption,
      clearFilter,
      resetFilters,
      setSort,
      history,
      removeFromHistory: remove,
      leaveSearch,
      searching,
    }),
    [
      query,
      city,
      filters,
      sort,
      activeFilterCount,
      results,
      total,
      loading,
      searchId,
      setQuery,
      setCity,
      toggleFilterOption,
      clearFilter,
      resetFilters,
      setSort,
      history,
      remove,
      leaveSearch,
      searching,
    ],
  )

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used within SearchProvider")
  return ctx
}
