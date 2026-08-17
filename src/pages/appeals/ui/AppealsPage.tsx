import { useEffect } from "react"
import { APPEALS } from "@/entities/appeal"
import { AppShell } from "@/widgets/app-shell"
import { AppealList } from "@/widgets/appeal-list"
import { AppealChat } from "@/widgets/appeal-chat"
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

  const found = APPEALS.find((a) => a.id === appealId)
  // Wide: fall back to the first thread. Narrow: no id means the list.
  const selected = narrow ? found : (found ?? APPEALS[0])

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

  const showList = !narrow || !selected
  const showChat = Boolean(selected) && (!narrow || Boolean(appealId))

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
          onBack={
            narrow
              ? () => navigate({ name: "appeals" }, { replace: true })
              : undefined
          }
        />
      )}
    </AppShell>
  )
}
