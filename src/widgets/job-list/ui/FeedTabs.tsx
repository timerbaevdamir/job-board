import { FEEDS, type FeedId } from "@/entities/job"
import { cn } from "@/shared/lib/cn"

/**
 * Horizontal role feeds above the vacancy list. The selected tab is a black
 * pill; the rest are labels with no fill — personal cuts, not filter chips.
 */
export function FeedTabs({
  value,
  onChange,
}: {
  value: FeedId
  onChange: (id: FeedId) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Ленты"
      className="-mx-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:-mx-8 [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max items-center gap-1 px-4 sm:px-8">
        {FEEDS.map((feed) => {
          const selected = feed.id === value
          return (
            <button
              key={feed.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(feed.id)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 text-sm font-semibold leading-5",
                selected
                  ? "rounded-full bg-foreground text-background"
                  : "text-foreground",
              )}
            >
              {feed.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
