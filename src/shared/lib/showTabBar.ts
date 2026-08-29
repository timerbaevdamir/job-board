import type { LayoutMode } from "./useLayoutMode"
import type { Route } from "./router"

/**
 * Whether the phone tab bar is in the shell for this layout and route.
 *
 * Only mobile draws one. A thread is its own screen (back lives in the header,
 * and the bar would sit under the composer); a vacancy opened from a thread is
 * the next overlay on that stack, so the bar stays off. Search, the appeals
 * list, and a vacancy opened from search keep it.
 *
 * Tablet and desktop use the rail instead — never this bar, and never its
 * height as a snackbar inset.
 */
export function showTabBar(
  mode: LayoutMode,
  route: Route,
  via?: "appeal",
): boolean {
  if (mode !== "mobile") return false
  if (route.name === "appeals" && Boolean(route.appealId)) return false
  if (route.name === "job" && via === "appeal") return false
  return true
}
