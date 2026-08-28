import type { RefObject } from "react"
import type { Job } from "@/entities/job"
import {
  ArrowLeftIcon,
  DotsIcon,
  HeartIcon,
  ShareIcon,
  XIcon,
} from "@/shared/ui/icons"
import { Header, HeaderAction, HeaderActions } from "@/shared/ui/Header"
import { useSaved } from "@/features/save-job"
import { cn } from "@/shared/lib/cn"

/** Vacancy chrome: the shared header with the HUD modifier. */
export function DetailHeader({
  job,
  onBack,
  titleRef,
  inset = "flush",
  dismiss = "back",
}: {
  job: Job
  onBack: () => void
  titleRef: RefObject<HTMLHeadingElement | null>
  inset?: "flush" | "tight" | "column"
  /** Column beside chat uses close; a full screen still goes back. */
  dismiss?: "back" | "close"
}) {
  const { isSaved, toggleSaved } = useSaved()
  const saved = isSaved(job.id)

  return (
    <Header
      sticky
      hud
      titleRef={titleRef}
      align="center"
      inset={inset}
      width="column"
      start={
        dismiss === "close" ? (
          <HeaderAction tone="ghost" aria-label="Закрыть" onClick={onBack}>
            <XIcon className="size-6" />
          </HeaderAction>
        ) : (
          <HeaderAction tone="ghost" aria-label="Назад" onClick={onBack}>
            <ArrowLeftIcon className="size-6" />
          </HeaderAction>
        )
      }
      end={
        <HeaderActions>
          <HeaderAction
            tone="ghost"
            onClick={() => toggleSaved(job.id)}
            aria-pressed={saved}
            aria-label={saved ? "Убрать из избранного" : "В избранное"}
          >
            <HeartIcon
              className={cn(
                "size-6 transition-colors",
                saved ? "text-danger" : "text-foreground",
              )}
              fill={saved ? "currentColor" : "none"}
            />
          </HeaderAction>
          <HeaderAction tone="ghost" aria-label="Поделиться">
            <ShareIcon className="size-6" />
          </HeaderAction>
          <HeaderAction tone="ghost" aria-label="Ещё">
            <DotsIcon className="size-6" />
          </HeaderAction>
        </HeaderActions>
      }
    >
      <span className="min-w-0 w-full truncate text-center text-base font-semibold text-foreground">
        {job.title}
      </span>
    </Header>
  )
}
