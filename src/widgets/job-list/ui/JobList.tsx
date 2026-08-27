import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  JobCard,
  JobCardSkeleton,
  jobMatchesFeed,
  type FeedId,
  type SortId,
} from "@/entities/job"
import { useSaved } from "@/features/save-job"
import { useApplications } from "@/features/apply"
import { useSearch } from "@/features/job-search"
import { useSnackbar } from "@/shared/ui/Snackbar"
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@/shared/ui/icons"
import { OptionRow, RadioMark } from "@/shared/ui/OptionRow"
import { cn } from "@/shared/lib/cn"
import { vacancies } from "@/shared/lib/plural"
import { FeedTabs } from "./FeedTabs"

const SORTS: { id: SortId; label: string }[] = [
  { id: "match", label: "По соответствию" },
  { id: "date", label: "По дате" },
  { id: "salary", label: "По убыванию дохода" },
]

/**
 * Toolbar shown above the feed: the result count, then sort and the search
 * subscription. One line on a wide screen (count left, controls right); on a
 * phone the controls take their own row and sit at opposite edges.
 */
function FeedToolbar() {
  const [sortOpen, setSortOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const { show } = useSnackbar()
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
    // Count left, controls right. `gap-x-6` keeps them apart if the row has
    // to wrap on a narrow column.
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-1 pt-3 md:pt-0">
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

      <div className="flex w-full items-center justify-between gap-6 md:w-auto">
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
            <div className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-popover md:left-auto md:right-0">
              {SORTS.map((s) => (
                <OptionRow
                  key={s.id}
                  selected={s.id === sort}
                  onClick={() => {
                    setSort(s.id)
                    setSortOpen(false)
                  }}
                  start={<RadioMark checked={s.id === sort} />}
                >
                  <span className="text-sm leading-5">{s.label}</span>
                </OptionRow>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to this search */}
        <button
          type="button"
          aria-pressed={following}
          onClick={() => {
            const next = !following
            setFollowing(next)
            show({
              title: next
                ? "Вы подписались на поиск"
                : "Вы отписались от поиска",
            })
          }}
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
  /** In the search state a count/sort toolbar sits above the cards; otherwise
      the role-feed tabs do. */
  searching?: boolean
  /** Optional node interleaved into the feed after the {@link slotAfter} card. */
  slot?: ReactNode
  slotAfter?: number
}) {
  const { isSaved, toggleSaved } = useSaved()
  const { isApplied, apply } = useApplications()
  const { results, loading } = useSearch()
  const [feed, setFeed] = useState<FeedId>("for-you")
  const cards = useMemo(
    () =>
      searching ? results : results.filter((job) => jobMatchesFeed(job, feed)),
    [searching, results, feed],
  )

  return (
    <section className="flex flex-col gap-4">
      {searching ? <FeedToolbar /> : <FeedTabs value={feed} onChange={setFeed} />}

      {loading ? (
        // Request in flight: skeleton cards stand in for results (the
        // interleaved slot too — it belongs to the "arrived" feed).
        <div aria-busy className="flex flex-col gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {cards.map((job, i) => (
            <Fragment key={job.id}>
              <JobCard
                job={job}
                onSelect={onSelect}
                saved={isSaved(job.id)}
                applied={isApplied(job.id)}
                onToggleSave={toggleSaved}
                onApply={apply}
              />
              {slot && feed === "for-you" && i === slotAfter && slot}
            </Fragment>
          ))}
        </div>
      )}
    </section>
  )
}
