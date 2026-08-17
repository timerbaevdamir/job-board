import type { Job } from "@/entities/job"
import {
  ArrowLeftIcon,
  DotsIcon,
  HeartIcon,
  ShareIcon,
} from "@/shared/ui/icons"
import { useSaved } from "@/features/save-job"
import { HeaderFade } from "@/shared/ui/HeaderFade"
import { cn } from "@/shared/lib/cn"

// Segment of the iOS-style combined control; round hover highlight inside the pill.
const btn =
  "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"

/**
 * Sticky full-width header. A background fade fills it — solid at the top edge,
 * ramping to transparent at the bottom — so scrolled content dissolves under it
 * with no hard line. The controls ride on top.
 */
export function DetailHeader({ job, onBack }: { job: Job; onBack: () => void }) {
  const { isSaved, toggleSaved } = useSaved()
  const saved = isSaved(job.id)
  return (
    <header className="sticky top-0 z-20 pb-4 pt-6">
      <HeaderFade />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className={cn(btn, "bg-background/60 backdrop-blur-md")}
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <div className="flex items-center overflow-hidden rounded-full bg-background/60 backdrop-blur-md">
          <button
            type="button"
            onClick={() => toggleSaved(job.id)}
            aria-pressed={saved}
            aria-label={saved ? "Убрать из избранного" : "В избранное"}
            className={cn(btn, "active:scale-90")}
          >
            <HeartIcon
              className={cn(
                "size-6 transition-colors",
                saved ? "text-danger" : "text-foreground",
              )}
              fill={saved ? "currentColor" : "none"}
            />
          </button>
          <button type="button" aria-label="Поделиться" className={btn}>
            <ShareIcon className="size-6" />
          </button>
          <button type="button" aria-label="Ещё" className={btn}>
            <DotsIcon className="size-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
