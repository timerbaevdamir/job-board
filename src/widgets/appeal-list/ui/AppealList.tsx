import { Fragment, useState } from "react"
import { APPEALS, AppealListItem } from "@/entities/appeal"
import { SearchIcon, SlidersIcon } from "@/shared/ui/icons"
import { Header, HeaderAction } from "@/shared/ui/Header"
import { SEARCH_WELL } from "@/shared/ui/searchWell"

/** Left column of the appeals section: search + scrollable conversation list. */
export function AppealList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")

  const visible = APPEALS.filter(
    (a) =>
      a.company.toLowerCase().includes(query.trim().toLowerCase()) ||
      a.position.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    // Full width when it is the whole screen (mobile), a fixed column once the
    // chat sits beside it. `h-full`, not `h-screen`: below `md` the shell's tab
    // bar takes part of the viewport, and 100vh would push the input off-screen.
    <div className="flex h-full w-full shrink-0 flex-col bg-background md:w-[340px] md:border-r md:border-border">
      <Header
        edge
        padTitle
        end={
          <HeaderAction aria-label="Фильтры откликов">
            <SlidersIcon className="size-5" />
          </HeaderAction>
        }
        below={
          <label className={SEARCH_WELL}>
            <SearchIcon className="size-5 shrink-0 text-subtle" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск"
              className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
            />
          </label>
        }
      >
        <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.2px] text-foreground">
          Отклики
        </h1>
      </Header>

      {/* Conversations */}
      <div className="scroll-area flex-1 overflow-y-auto px-2 pb-4">
        <div className="flex flex-col">
          {visible.map((appeal, i) => (
            <Fragment key={appeal.id}>
              <AppealListItem
                appeal={appeal}
                selected={appeal.id === selectedId}
                onSelect={onSelect}
              />
              {/* Hairline under the text column: row p-3 + avatar size-11 + gap-3 */}
              {i < visible.length - 1 && (
                <span className="ml-[calc(--spacing(3)+--spacing(11)+--spacing(3))] mr-3 h-px shrink-0 bg-border" />
              )}
            </Fragment>
          ))}
          {visible.length === 0 && (
            <p className="px-4 py-8 text-center text-sm leading-5 text-muted">
              Ничего не найдено
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
