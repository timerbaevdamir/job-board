import { useEffect, useLayoutEffect, useRef } from "react"
import { JOBS } from "@/entities/job"
import { AppShell } from "@/widgets/app-shell"
import { NavStack } from "@/shared/ui/NavStack"
import { SearchHeader } from "@/widgets/search-header"
import { JobList } from "@/widgets/job-list"
import { JobDetailView } from "@/widgets/job-detail"
import { DiscoveryPanel } from "@/widgets/discovery-panel"
import { InterestingRoles } from "@/widgets/interesting"
import { useSearch } from "@/features/job-search"
import { navigate, back, useNavVia } from "@/shared/lib/router"
import { useScrollRestoration } from "@/shared/lib/useScrollRestoration"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

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
 * off-screen) and the 336px discovery column is desktop-only. Phone and
 * tablet put those cards in the feed, under search.
 */
export function JobBoardPage({ openJobId }: { openJobId: string | null }) {
  const openJob = openJobId
    ? (JOBS.find((j) => j.id === openJobId) ?? null)
    : null
  const fromAppeal = useNavVia() === "appeal"

  // The feed shows a count/sort toolbar as soon as the user has narrowed
  // anything — by query, by filter, or by city. On a phone or tablet the
  // discovery block sits under the field while browsing, and leaves once
  // the search is narrowed: those cards belong to browsing, not to a
  // result list.
  const { searchId, searching } = useSearch()
  const mode = useLayoutMode()

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
  // A layout effect, for the same reason the restoration above is one: it has
  // to land before the browser paints. `searchId` changes in the render that
  // first shows the skeletons, and an ordinary effect would run after that
  // frame — so the skeletons would appear once at the old offset and the feed
  // would snap up on the next frame.
  //
  // Compared against the previous id rather than just `searchId > 0`: this also
  // runs on mount, where the id is already non-zero from the search that ran
  // before the user left. Firing then would scroll to the top the moment the
  // restoration above had put the feed back where it was.
  const lastSearchId = useRef(searchId)
  useLayoutEffect(() => {
    if (searchId === lastSearchId.current) return
    lastSearchId.current = searchId
    feedRef.current?.scrollTo({ top: 0 })
  }, [searchId, feedRef])

  const openJobById = (id: string) => navigate({ name: "job", jobId: id })

  return (
    // An open vacancy carries its own apply bar along the bottom edge, and on
    // a phone that lands directly on the tab bar. The shell can't see it, so
    // it is told.
    <AppShell bottomBar={openJob !== null && !fromAppeal}>
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
                  chrome={fromAppeal ? "pane" : "page"}
                  onBack={() => back()}
                  onOpen={openJobById}
                />
              </div>
            ) : null
          }
        >
          <div ref={feedRef} className="scroll-area h-full overflow-y-auto">
            {/* `min-h-full` so a short page (empty search) can still fill the
                scrollport and center its empty state in the leftover space
                below the field. Results grow past it and scroll as before. */}
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pb-6 sm:px-8">
              <SearchHeader />
              {/* 16 from the field to the first card on a phone; wider
                  screens need more air under the search. */}
              <div className="flex flex-1 flex-col gap-10 pt-4 md:pt-8">
                {mode !== "desktop" && !searching && <DiscoveryPanel />}
                <JobList
                  onSelect={openJobById}
                  searching={searching}
                  slot={<InterestingRoles />}
                  slotAfter={1}
                />
              </div>
            </div>
          </div>
        </NavStack>
      </main>

      {/* `h-full`, not `h-screen`: the shell owns the viewport height, and a
          column that measures itself against the viewport would overshoot the
          moment anything else shares it. */}
      {mode === "desktop" && (
        <aside className="scroll-area h-full w-[336px] shrink-0 overflow-y-auto border-l border-border bg-surface">
          <DiscoveryPanel />
        </aside>
      )}
    </AppShell>
  )
}
