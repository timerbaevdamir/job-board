import { JOBS } from "@/entities/job"
import { JobBoardPage } from "@/pages/job-board"
import { AppealsPage } from "@/pages/appeals"
import { DevPage } from "@/pages/dev"
import { PlaceholderPage, isPlaceholderKind } from "@/pages/placeholder"
import { ApplicationsProvider } from "@/features/apply"
import { SavedProvider } from "@/features/save-job"
import { SearchProvider } from "@/features/job-search"
import { ThemeProvider } from "@/features/theme"
import { SnackbarProvider } from "@/shared/ui/Snackbar"
import { useNavVia, useRoute } from "@/shared/lib/router"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

// Seed favourites from the mock data; kept here so the feature stays data-agnostic.
const INITIAL_SAVED = JOBS.filter((j) => j.saved).map((j) => j.id)

/**
 * App root. In FSD the `app` layer wires providers, routing, and global chrome.
 * Routing is hash-based (see `shared/lib/router`) and resolved here: the route
 * picks the screen and supplies what it needs from the URL, so no screen keeps
 * its own idea of "where we are".
 *
 * A vacancy opened from a thread on a phone stays on the appeals page: the
 * chat is still mounted underneath so `NavStack` can slide the vacancy over
 * it. Wider screens still hand that vacancy to the board (full screen, then
 * Back) — the stack there does not animate, and the split list would otherwise
 * sit beside it.
 *
 * Saved, activity, and profile are placeholder screens until those sections
 * have real content; search, vacancies, and appeals keep their own pages.
 */
export default function App() {
  const route = useRoute()
  const via = useNavVia()
  const mode = useLayoutMode()
  const jobFromChat =
    route.name === "job" && via === "appeal" && mode === "mobile"

  return (
    <ThemeProvider>
      <SnackbarProvider>
        <ApplicationsProvider>
          <SavedProvider initialSaved={INITIAL_SAVED}>
            <SearchProvider>
              {route.name === "dev" ? (
                <DevPage />
              ) : route.name === "appeals" || jobFromChat ? (
                <AppealsPage
                  appealId={route.name === "appeals" ? route.appealId : undefined}
                  openJobId={route.name === "job" ? route.jobId : null}
                />
              ) : route.name === "section" && isPlaceholderKind(route.section) ? (
                <PlaceholderPage kind={route.section} />
              ) : (
                <JobBoardPage
                  openJobId={route.name === "job" ? route.jobId : null}
                />
              )}
            </SearchProvider>
          </SavedProvider>
        </ApplicationsProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
