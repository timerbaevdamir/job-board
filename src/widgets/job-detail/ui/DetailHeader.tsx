import { useEffect, useRef, useState, type RefObject } from "react"
import type { Job } from "@/entities/job"
import {
  ArrowLeftIcon,
  DotsIcon,
  HeartIcon,
  ShareIcon,
} from "@/shared/ui/icons"
import { useSaved } from "@/features/save-job"
import { cn } from "@/shared/lib/cn"

// Segment of the iOS-style combined control; round hover highlight inside the pill.
const btn =
  "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"

/** Sticky header with a compact title that appears once the page title scrolls behind it. */
export function DetailHeader({
  job,
  onBack,
  titleRef,
}: {
  job: Job
  onBack: () => void
  titleRef: RefObject<HTMLHeadingElement | null>
}) {
  const headerRef = useRef<HTMLElement>(null)
  const [titleScrolled, setTitleScrolled] = useState(false)
  const { isSaved, toggleSaved } = useSaved()
  const saved = isSaved(job.id)

  useEffect(() => {
    const title = titleRef.current
    const header = headerRef.current
    const scroller = title?.closest<HTMLElement>(".scroll-area")
    if (!title || !header || !scroller) return

    const update = () => {
      setTitleScrolled(title.getBoundingClientRect().top <= header.getBoundingClientRect().bottom)
    }
    update()
    scroller.addEventListener("scroll", update, { passive: true })
    return () => scroller.removeEventListener("scroll", update)
  }, [titleRef])

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-20 bg-background pb-4 pt-4 sm:pb-5 sm:pt-5",
        titleScrolled && "border-b border-border/70",
      )}
    >
      <div className="relative z-10 mx-auto flex min-h-10 w-full max-w-3xl items-center gap-3 px-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className={cn(btn, "shrink-0")}
        >
          <ArrowLeftIcon className="size-6" />
        </button>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-center text-base font-semibold text-foreground transition-[opacity,transform] duration-200",
            titleScrolled ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
          )}
          aria-hidden={!titleScrolled}
        >
          {job.title}
        </span>
        <div className="flex shrink-0 items-center overflow-hidden rounded-full">
          <button
            type="button"
            onClick={() => toggleSaved(job.id)}
            aria-pressed={saved}
            aria-label={saved ? "Убрать из избранного" : "В избранное"}
            className={btn}
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
