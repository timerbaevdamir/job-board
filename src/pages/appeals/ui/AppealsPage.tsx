import { useEffect, useState } from "react"
import { APPEALS } from "@/entities/appeal"
import { JOBS } from "@/entities/job"
import { AppShell } from "@/widgets/app-shell"
import { AppealList } from "@/widgets/appeal-list"
import { AppealChat } from "@/widgets/appeal-chat"
import { JobDetailView } from "@/widgets/job-detail"
import { navigate } from "@/shared/lib/router"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

/**
 * Appeals (messenger) section. The open thread lives in the URL
 * (`#/appeals/<id>`), so a conversation is linkable and Back steps between
 * threads.
 *
 * Wide enough for two columns, the list and the chat sit side by side and the
 * URL always names a thread — landing on `#/appeals` opens the first one, since
 * an empty chat column would be dead space.
 *
 * On a narrow screen the two columns become two screens: `#/appeals` *is* the
 * list, and picking a conversation navigates into it. That makes the bare
 * address meaningful rather than a redirect, and the browser's Back button
 * leaves the thread the same way the header's arrow does — one history entry
 * per conversation, not per redirect.
 */
export function AppealsPage({ appealId }: { appealId?: string }) {
  const mode = useLayoutMode()
  const narrow = mode === "mobile"
  // Third column only where the viewport already holds list + chat. Tablet
  // opens a vacancy the same way search does: a full screen, then Back.
  const splitVacancy = mode === "desktop"

  const found = APPEALS.find((a) => a.id === appealId)
  // Wide: fall back to the first thread. Narrow: no id means the list.
  const selected = narrow ? found : (found ?? APPEALS[0])

  const [jobPaneOpen, setJobPaneOpen] = useState(false)
  const [paneJobId, setPaneJobId] = useState<string | null>(null)

  useEffect(() => {
    // Only correct the URL when it names a thread that isn't the one shown —
    // an unknown id, or the wide layout's implicit first conversation.
    if (selected && selected.id !== appealId) {
      navigate({ name: "appeals", appealId: selected.id }, { replace: true })
    }
    // Narrow layout with an id that matches nothing: drop back to the list.
    if (narrow && appealId && !found) {
      navigate({ name: "appeals" }, { replace: true })
    }
  }, [selected, appealId, narrow, found])

  // A phone must not inherit a desktop pane after a resize.
  useEffect(() => {
    if (!splitVacancy) {
      setJobPaneOpen(false)
      setPaneJobId(null)
    }
  }, [splitVacancy])

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

  const showList = !narrow || !selected
  const showChat = Boolean(selected) && (!narrow || Boolean(appealId))
  const showJobPane = splitVacancy && jobPaneOpen && paneJob

  return (
    <AppShell collapsed>
      {showList && (
        <AppealList
          selectedId={selected?.id ?? ""}
          onSelect={(id) => navigate({ name: "appeals", appealId: id })}
        />
      )}
      {showChat && selected && (
        <AppealChat
          appeal={selected}
          jobInfoOpen={showJobPane}
          onJobInfo={onJobInfo}
          onBack={
            narrow
              ? () => navigate({ name: "appeals" }, { replace: true })
              : undefined
          }
        />
      )}
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
