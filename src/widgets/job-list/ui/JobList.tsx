import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { JobCard, JobCardSkeleton, type SortId } from "@/entities/job"
import { useSaved } from "@/features/save-job"
import { useApplications } from "@/features/apply"
import { useSearch } from "@/features/job-search"
import {
  BellIcon,
  CheckIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { vacancies } from "@/shared/lib/plural"

const SORTS: { id: SortId; label: string }[] = [
  { id: "match", label: "По соответствию" },
  { id: "date", label: "По дате" },
  { id: "salary", label: "По убыванию дохода" },
]

/**
 * Toolbar shown above the feed: the result count on the left, sort and the
 * search subscription on the right, all on one line.
 */
function FeedToolbar() {
  const [sortOpen, setSortOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  // Sorting is a server concern — it re-runs the query. Subscribing is not.
  const { loading, total, sort, setSort } = useSearch()

  useEffect(() => {
    if (!sortOpen) return
    const onDown = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [sortOpen])

  const sortLabel = SORTS.find((s) => s.id === sort)?.label

  return (
    // One line: count left, controls right. `gap-x-6` keeps them apart if the
    // row has to wrap on a narrow column.
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-1">
      {loading ? (
        <div className="flex h-[22px] items-center">
          <div className="h-4 w-44 animate-pulse rounded-lg bg-chip" />
        </div>
      ) : (
        <p className="text-base leading-[22px] text-muted">
          {total === 0
            ? "Ничего не найдено"
            : `Найдено ${total} ${vacancies(total)}`}
        </p>
      )}

      <div className="flex items-center gap-6">
        {/* Sort dropdown — right-aligned, so its panel hangs from the right edge. */}
        <div ref={sortRef} className="relative">
          <button
            type="button"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((o) => !o)}
            className="flex items-center gap-1 text-base leading-[22px] text-foreground transition-colors hover:text-muted"
          >
            {sortLabel}
            <ChevronDownIcon
              className={cn(
                "size-4 text-subtle transition-transform",
                sortOpen && "rotate-180",
              )}
            />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-popover">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSort(s.id)
                    setSortOpen(false)
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm leading-5 text-foreground transition-colors hover:bg-black/[0.04]"
                >
                  {s.label}
                  {s.id === sort && (
                    <CheckIcon className="size-4 text-info" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to this search */}
        <button
          type="button"
          aria-pressed={following}
          onClick={() => setFollowing((v) => !v)}
          className={cn(
            "flex shrink-0 items-center gap-2 text-base leading-[22px] transition-colors",
            following ? "text-info" : "text-foreground hover:text-muted",
          )}
        >
          <BellIcon className="size-5" />
          {following ? "Вы подписаны" : "Подписаться"}
        </button>
      </div>
    </div>
  )
}

/** Shown when the current query/filters match nothing. */
function EmptyState() {
  const { query, activeFilterCount } = useSearch()
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-strong/70 bg-surface px-6 py-14 text-center">
      <SearchIcon className="size-8 text-faint" />
      <p className="text-lg font-semibold leading-[26px] text-foreground">
        {query
          ? `По запросу «${query}» ничего не найдено`
          : "Ничего не найдено"}
      </p>
      <p className="max-w-sm text-sm leading-6 text-muted">
        {activeFilterCount > 0
          ? "Попробуйте убрать часть фильтров или изменить запрос."
          : "Попробуйте изменить запрос — например, использовать более общую формулировку."}
      </p>
    </div>
  )
}

export function JobList({
  onSelect,
  searching = false,
  slot,
  slotAfter = 1,
}: {
  onSelect: (id: string) => void
  /** In the search state the toolbar replaces the "Вакансии для вас" heading. */
  searching?: boolean
  /** Optional node interleaved into the feed after the {@link slotAfter} card. */
  slot?: ReactNode
  slotAfter?: number
}) {
  const { isSaved, toggleSaved } = useSaved()
  const { isApplied, apply } = useApplications()
  const { results, loading } = useSearch()

  return (
    <section className="flex flex-col gap-4">
      {searching ? (
        <FeedToolbar />
      ) : (
        <h2 className="text-[28px] font-semibold leading-10 tracking-[-0.35px] text-foreground">
          Вакансии для вас
        </h2>
      )}

      {loading ? (
        // Request in flight: skeleton cards stand in for results (the
        // interleaved slot too — it belongs to the "arrived" feed).
        <div aria-busy className="flex flex-col gap-3">
          {Array.from({ length: 4 }, (_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((job, i) => (
            <Fragment key={job.id}>
              <JobCard
                job={job}
                onSelect={onSelect}
                saved={isSaved(job.id)}
                applied={isApplied(job.id)}
                onToggleSave={toggleSaved}
                onApply={apply}
              />
              {slot && i === slotAfter && slot}
            </Fragment>
          ))}
        </div>
      )}
    </section>
  )
}
