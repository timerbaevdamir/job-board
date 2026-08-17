/**
 * Searching for vacancies: the query field with its suggestions and city
 * picker, the filter chips with their popover / sheet / drawer, the sort, and
 * the session that ties them together.
 *
 * These were two slices — `job-search` and `job-filters` — and the split was by
 * control rather than by capability. Both edit one search session, the filter
 * bar renders inside the search field, and changing a filter re-runs the same
 * request typing does. Being separate forced their shared state down onto the
 * entity layer to avoid a feature importing a feature, which left a "search
 * entity" that was not an entity at all and had to reach across to `job` to do
 * its work. One slice removes both problems: the state is internal again, and
 * the only thing crossing a layer boundary is this feature reading `job`.
 */
export { SearchField } from "./ui/SearchField"
export { FilterBar } from "./ui/FilterBar"
export { SearchProvider, useSearch } from "./model/store"
export { matchSuggestions } from "./lib/matchSuggestions"
export { orderFilters } from "./lib/orderFilters"
