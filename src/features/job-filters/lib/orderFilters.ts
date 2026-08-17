import type { Filter, FilterSelection } from "@/shared/config/filters"

/**
 * Applied filters float to the front; within each group the catalog sequence is
 * preserved as the priority. Pure — pass the catalog (which also defines the
 * default order) and the current selection.
 */
export function orderFilters(
  catalog: Filter[],
  selection: FilterSelection,
): Filter[] {
  const priority = new Map(catalog.map((f, i) => [f.id, i]))
  const isActive = (f: Filter) => (selection[f.id]?.length ?? 0) > 0
  return [...catalog].sort((a, b) => {
    const aa = isActive(a)
    const bb = isActive(b)
    if (aa !== bb) return aa ? -1 : 1
    return (priority.get(a.id) ?? 0) - (priority.get(b.id) ?? 0)
  })
}
