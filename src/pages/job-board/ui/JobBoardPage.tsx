import { useEffect, useRef } from "react"
import { JOBS, ANY_CITY } from "@/entities/job"
import { AppShell } from "@/widgets/app-shell"
import { NavStack } from "@/shared/ui/NavStack"
import { SearchHeader } from "@/widgets/search-header"
import { JobList } from "@/widgets/job-list"
import { JobDetailView } from "@/widgets/job-detail"
import { DiscoveryPanel } from "@/widgets/discovery-panel"
import { InterestingRoles } from "@/widgets/interesting"
import { useSearch } from "@/entities/search"
import { navigate } from "@/shared/lib/router"
import { useScrollRestoration } from "@/shared/lib/useScrollRestoration"

/**
 * Job board: the feed (or an opened vacancy) plus the discovery rail.
 *
 * Which vacancy is open comes from the URL (`#/job/<id>`), so a vacancy is
 * linkable and the browser's Back button steps out of it instead of leaving the
 * app. An id that matches nothing falls back to the feed and rewrites the URL,
 * so a stale link doesn't strand the user on a blank screen.
 *
 * Columns: the nav rail comes from {@link AppShell}; the center is `flex-1
 * min-w-0` (so it can shrink below its content instead of pushing the rail
 * off-screen) and the 336px discovery column drops out below `lg`.
 */
export function JobBoardPage({ openJobId }: { openJobId: string | null }) {
  const openJob = openJobId
    ? (JOBS.find((j) => j.id === openJobId) ?? null)
    : null

  // The feed swaps its "Вакансии для вас" heading for the search toolbar as
  // soon as the user has narrowed anything — by query, by filter, or by city.
  // None of those require typing any more, and a narrowed feed still has to
  // report how many results it found and let them be re-sorted.
  const { query, city, activeFilterCount, searchId } = useSearch()
  const searching =
    query.trim().length > 0 || activeFilterCount > 0 || city !== ANY_CITY

  // Unknown vacancy id (stale or hand-typed link): drop back to the feed and
  // replace the entry so Back doesn't return to the dead URL.
  useEffect(() => {
    if (openJobId && !openJob) navigate({ name: "search" }, { replace: true })
  }, [openJobId, openJob])

  // Leaving for another section unmounts this page, so the feed's scroll offset
  // is kept outside the component and put back on the way in.
  const feedRef = useScrollRestoration<HTMLDivElement>("job-board-feed")

  // A new search replaces the results, so the feed jumps back to the top —
  // instantly (no smooth scroll), the way a swapped result page would.
  //
  // Compared against the previous id rather than just `searchId > 0`: this
  // effect also runs on mount, where the id is already non-zero from the search
  // that ran before the user left. Firing then would scroll to the top the
  // moment the restoration above had put the feed back where it was.
  const lastSearchId = useRef(searchId)
  useEffect(() => {
    if (searchId === lastSearchId.current) return
    lastSearchId.current = searchId
    feedRef.current?.scrollTo({ top: 0 })
  }, [searchId, feedRef])

  const openJobById = (id: string) => navigate({ name: "job", jobId: id })

  return (
    // An open vacancy carries its own apply bar along the bottom edge, and on
    // a phone that lands directly on the tab bar. The shell can't see it, so
    // it is told.
    <AppShell bottomBar={openJob !== null}>
      {/* The feed and the detail view are separate scroll containers so their
          scroll positions never bleed into each other: the feed stays mounted
          (its scroll is preserved) while the detail view scrolls on its own.

          That both are mounted at once is also what lets `NavStack` slide one
          over the other on a phone — the parallax needs the covered screen to
          still be there. */}
      <main className="flex min-w-0 flex-1">
        <NavStack
          className="flex-1"
          overlay={
            // A ternary, not `&&`: `false` is a perfectly good ReactNode, so an
            // `&&` here would hand the stack a "present" overlay with nothing
            // in it every time the feed is showing.
            openJob ? (
              // The detail view owns its scroll column: its sticky header and
              // footer are full-bleed and it centers its own content, so there
              // is no shared padding to hoist out of it.
              <div className="scroll-area h-full overflow-y-auto">
                <JobDetailView
                  job={openJob}
                  onBack={() => navigate({ name: "search" })}
                  onOpen={openJobById}
                />
              </div>
            ) : null
          }
        >
          <div ref={feedRef} className="scroll-area h-full overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-6 sm:px-8">
              <SearchHeader />
              <JobList
                onSelect={openJobById}
                searching={searching}
                slot={<InterestingRoles />}
                slotAfter={1}
              />
            </div>
          </div>
        </NavStack>
      </main>

      {/* `h-full`, not `h-screen`: the shell owns the viewport height, and a
          column that measures itself against the viewport would overshoot the
          moment anything else shares it. */}
      <aside className="scroll-area hidden h-full w-[336px] shrink-0 overflow-y-auto border-l border-border bg-surface lg:block">
        <DiscoveryPanel />
      </aside>
    </AppShell>
  )
}
