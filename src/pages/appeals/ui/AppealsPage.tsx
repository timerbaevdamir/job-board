import { useEffect, useState } from "react"
import { APPEALS } from "@/entities/appeal"
import { JOBS } from "@/entities/job"
import { AppShell } from "@/widgets/app-shell"
import { NavStack } from "@/shared/ui/NavStack"
import { AppealList } from "@/widgets/appeal-list"
import { AppealChat } from "@/widgets/appeal-chat"
import { JobDetailView } from "@/widgets/job-detail"
import { navigate, back } from "@/shared/lib/router"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

/**
 * Appeals (messenger) section. The open thread lives in the URL
 * (`#/appeals/<id>`), so a conversation is linkable and Back steps out of it
 * the same way it leaves a vacancy.
 *
 * The list and the thread are the same two layers the job board uses: a base
 * that stays, and an overlay that `NavStack` slides over it on a phone. Wider
 * screens replace the list with the thread — no slide, the way a vacancy
 * replaces the feed. An id that matches nothing falls back to the list and
 * rewrites the URL, so a stale link doesn't strand the user on a blank screen.
 *
 * Desktop can still open the vacancy as a third column beside the thread;
 * phone and tablet navigate to it, then Back.
 */
export function AppealsPage({ appealId }: { appealId?: string }) {
  const mode = useLayoutMode()
  // Third column only where the viewport already holds a vacancy pane on the
  // board. Tablet opens a vacancy the same way search does: a full screen,
  // then Back.
  const splitVacancy = mode === "desktop"

  const found = APPEALS.find((a) => a.id === appealId)
  const selected = found ?? null

  const [jobPaneOpen, setJobPaneOpen] = useState(false)
  const [paneJobId, setPaneJobId] = useState<string | null>(null)

  // Unknown thread id (stale or hand-typed link): drop back to the list and
  // replace the entry so Back doesn't return to the dead URL.
  useEffect(() => {
    if (appealId && !found) {
      navigate({ name: "appeals" }, { replace: true })
    }
  }, [appealId, found])

  // A phone must not inherit a desktop pane after a resize; leaving the
  // thread closes the pane so it cannot sit beside the list alone.
  useEffect(() => {
    if (!splitVacancy || !selected) {
      setJobPaneOpen(false)
      setPaneJobId(null)
    }
  }, [splitVacancy, selected])

  // Switching threads while the pane is open shows that thread's vacancy.
  useEffect(() => {
    if (!jobPaneOpen || !selected) return
    setPaneJobId(selected.jobId)
  }, [selected, jobPaneOpen])

  const paneJob = paneJobId
    ? (JOBS.find((j) => j.id === paneJobId) ?? null)
    : null

  const onJobInfo = () => {
    if (!selected) return
    if (splitVacancy) {
      if (jobPaneOpen) {
        setJobPaneOpen(false)
      } else {
        setPaneJobId(selected.jobId)
        setJobPaneOpen(true)
      }
      return
    }
    navigate({ name: "job", jobId: selected.jobId }, { via: "appeal" })
  }

  const showJobPane = splitVacancy && jobPaneOpen && paneJob

  return (
    <AppShell collapsed bottomBar={selected !== null}>
      {/* The list and the thread are separate scroll containers so their
          scroll positions never bleed into each other: the list stays mounted
          (its scroll is preserved) while the thread scrolls on its own.

          That both are mounted at once is also what lets `NavStack` slide one
          over the other on a phone — the parallax needs the covered screen to
          still be there. */}
      <main className="flex min-w-0 flex-1">
        <NavStack
          className="flex-1"
          overlay={
            // A ternary, not `&&`: `false` is a perfectly good ReactNode, so an
            // `&&` here would hand the stack a "present" overlay with nothing
            // in it every time the list is showing.
            selected ? (
              <AppealChat
                appeal={selected}
                jobInfoOpen={showJobPane}
                onJobInfo={onJobInfo}
                onBack={() => back({ name: "appeals" })}
              />
            ) : null
          }
        >
          <AppealList
            selectedId={selected?.id ?? null}
            onSelect={(id) => navigate({ name: "appeals", appealId: id })}
          />
        </NavStack>
      </main>
      {showJobPane && paneJob && (
        <aside className="scroll-area h-full w-[400px] shrink-0 overflow-y-auto border-l border-border bg-background">
          <JobDetailView
            job={paneJob}
            chrome="pane"
            dismiss="close"
            onBack={() => setJobPaneOpen(false)}
            onOpen={setPaneJobId}
          />
        </aside>
      )}
    </AppShell>
  )
}
