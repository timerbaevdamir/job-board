/**
 * Type-ahead matcher. Matches on the whole phrase OR on any word token
 * (length ≥ 2), so a fully typed phrase like "продуктовый дизайнер" still
 * surfaces related roles instead of only itself (the exact match is excluded).
 * Pure and side-effect free, so it can be unit-tested without rendering.
 */
export function matchSuggestions(
  pool: string[],
  raw: string,
  limit = 6,
): string[] {
  const q = raw.trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2)
  return pool
    .filter((s) => {
      const low = s.toLowerCase()
      if (low === q) return false
      return low.includes(q) || tokens.some((t) => low.includes(t))
    })
    .slice(0, limit)
}
