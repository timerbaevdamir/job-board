import { useEffect, useRef, useState } from "react"
import { APPEALS } from "@/entities/appeal"
import { JOBS } from "@/entities/job"
import { AppShell } from "@/widgets/app-shell"
import { NavStack } from "@/shared/ui/NavStack"
import { AppealList } from "@/widgets/appeal-list"
import { AppealChat } from "@/widgets/appeal-chat"
import { JobDetailView } from "@/widgets/job-detail"
import { navigate, back, useNavFrom } from "@/shared/lib/router"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

/**
 * Appeals (messenger) section. The open thread lives in the URL
 * (`#/appeals/<id>`), so a conversation is linkable and Back steps between
 * threads — and, on a phone, out of a vacancy opened from one.
 *
 * On a phone this is the same stack the job board uses: the list is the base,
 * the thread is an overlay that `NavStack` slides over it, and a vacancy
 * opened from info is a second overlay on the thread (nested `NavStack`, same
 * phase machine). Wider screens keep the list beside the chat; desktop can
 * still open the vacancy as a third column.
 *
 * An id that matches nothing falls back to the list (phone) or the first
 * thread (wide) and rewrites the URL, so a stale link doesn't strand the user
 * on a blank screen.
 */
export function AppealsPage({
  appealId,
  openJobId = null,
}: {
  appealId?: string
  /** Vacancy opened from a thread (`#/job/<id>` via appeal). Phone only. */
  openJobId?: string | null
}) {
  const mode = useLayoutMode()
  const narrow = mode === "mobile"
  // Third column only where the viewport already holds list + chat. Tablet
  // opens a vacancy the same way search does: a full screen, then Back.
  const splitVacancy = mode === "desktop"
  const from = useNavFrom()
  const lastAppealId = useRef(appealId)
  if (appealId) lastAppealId.current = appealId

  const threadId =
    appealId ?? (openJobId ? (from ?? lastAppealId.current) : undefined)
  const found = APPEALS.find((a) => a.id === threadId)
  // Wide: fall back to the first thread. Narrow: no id means the list.
  const selected = narrow ? found : (found ?? APPEALS[0])

  const [jobPaneOpen, setJobPaneOpen] = useState(false)
  const [paneJobId, setPaneJobId] = useState<string | null>(null)

  useEffect(() => {
    // A vacancy overlay owns the URL (`#/job/<id>`); don't rewrite it back
    // to the thread while it is showing.
    if (openJobId) return
    // Only correct the URL when it names a thread that isn't the one shown —
    // an unknown id, or the wide layout's implicit first conversation.
    if (selected && selected.id !== appealId) {
      navigate({ name: "appeals", appealId: selected.id }, { replace: true })
    }
    // Narrow layout with an id that matches nothing: drop back to the list.
    if (narrow && appealId && !found) {
      navigate({ name: "appeals" }, { replace: true })
    }
  }, [selected, appealId, narrow, found, openJobId])

  // Unknown vacancy opened from a thread: drop back to that thread.
  useEffect(() => {
    if (!openJobId || splitVacancy) return
    if (JOBS.some((j) => j.id === openJobId)) return
    navigate(
      selected
        ? { name: "appeals", appealId: selected.id }
        : { name: "appeals" },
      { replace: true },
    )
  }, [openJobId, splitVacancy, selected])

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

  const overlayJob =
    !splitVacancy && openJobId
      ? (JOBS.find((j) => j.id === openJobId) ?? null)
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
    navigate(
      { name: "job", jobId: selected.jobId },
      { via: "appeal", from: selected.id },
    )
  }

  const showList = !narrow || !selected
  const showChat = Boolean(selected) && (!narrow || Boolean(appealId) || Boolean(overlayJob))
  const showJobPane = splitVacancy && jobPaneOpen && paneJob

  const thread = selected ? (
    <NavStack
      className="h-full min-h-0 min-w-0 flex-1"
      overlay={
        overlayJob ? (
          <div className="scroll-area h-full overflow-y-auto">
            <JobDetailView
              job={overlayJob}
              chrome="pane"
              onBack={() =>
                back({ name: "appeals", appealId: selected.id })
              }
              onOpen={(id) =>
                navigate(
                  { name: "job", jobId: id },
                  { via: "appeal", from: selected.id },
                )
              }
            />
          </div>
        ) : null
      }
    >
      <AppealChat
        appeal={selected}
        jobInfoOpen={showJobPane}
        onJobInfo={onJobInfo}
        onBack={
          narrow ? () => back({ name: "appeals" }) : undefined
        }
      />
    </NavStack>
  ) : null

  return (
    <AppShell collapsed>
      {narrow ? (
        <main className="flex min-w-0 flex-1">
          <NavStack className="flex-1" overlay={thread}>
            <AppealList
              selectedId={selected?.id ?? null}
              onSelect={(id) => navigate({ name: "appeals", appealId: id })}
            />
          </NavStack>
        </main>
      ) : (
        <>
          {showList && (
            <AppealList
              selectedId={selected?.id ?? null}
              onSelect={(id) => navigate({ name: "appeals", appealId: id })}
            />
          )}
          {showChat && thread}
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
        </>
      )}
    </AppShell>
  )
}
