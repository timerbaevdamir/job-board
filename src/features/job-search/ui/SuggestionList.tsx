import { ClockIcon, SearchIcon, SparklesIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { SearchRow } from "./SearchRow"

export const LISTBOX_ID = "search-listbox"
export const optionId = (index: number) => `search-option-${index}`

/**
 * What the search offers below the input: matches once something is typed,
 * and recent searches plus recommendations before that.
 *
 * One rendering for both ways the search is presented — the panel that unfurls
 * inside the field on a wide screen, and the sheet that covers the screen on a
 * phone. They differ in where they appear and how they are dismissed, not in
 * what a suggestion is, and the ARIA wiring in particular (one `listbox`, one
 * numbering, `aria-activedescendant` pointing into it) only works if there is
 * exactly one of it.
 *
 * Only one is ever mounted, so the ids can be fixed rather than generated.
 */
export function SuggestionList({
  shown,
  suggestions,
  history,
  recommended,
  activeIndex,
  onSelect,
  onRemoveFromHistory,
  className,
}: {
  /** Matches, or the pre-typing state of recents and recommendations. */
  shown: "suggestions" | "empty"
  suggestions: string[]
  history: string[]
  recommended: string[]
  /** Index into the flat option order, or -1. */
  activeIndex: number
  onSelect: (value: string) => void
  onRemoveFromHistory: (value: string) => void
  className?: string
}) {
  return (
    <ul id={LISTBOX_ID} role="listbox" className={cn("flex flex-col", className)}>
      {shown === "suggestions" &&
        suggestions.map((s, i) => (
          <SearchRow
            key={s}
            id={optionId(i)}
            icon={SearchIcon}
            label={s}
            active={activeIndex === i}
            onSelect={() => onSelect(s)}
          />
        ))}

      {shown === "empty" && (
        <>
          {history.length > 0 && (
            <li role="presentation" className="flex flex-col">
              <p className="px-2 pb-1 pt-1 text-xs font-medium uppercase tracking-wide text-faint">
                Недавние
              </p>
              <ul role="presentation" className="flex flex-col">
                {history.map((h, i) => (
                  <SearchRow
                    key={h}
                    id={optionId(i)}
                    icon={ClockIcon}
                    label={h}
                    active={activeIndex === i}
                    onSelect={() => onSelect(h)}
                    onRemove={() => onRemoveFromHistory(h)}
                  />
                ))}
              </ul>
            </li>
          )}
          {recommended.length > 0 && (
            <li role="presentation" className="flex flex-col">
              {/* Extra room above: this heading follows the last "Недавние"
                  row, and without it the two groups read as one run of items. */}
              <p className="px-2 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-faint">
                Рекомендуем
              </p>
              <ul role="presentation" className="flex flex-col">
                {recommended.map((r, i) => {
                  // The two groups are one numbering: arrow keys walk from the
                  // last recent into the first recommendation without a gap.
                  const flat = history.length + i
                  return (
                    <SearchRow
                      key={r}
                      id={optionId(flat)}
                      icon={SparklesIcon}
                      label={r}
                      active={activeIndex === flat}
                      onSelect={() => onSelect(r)}
                    />
                  )
                })}
              </ul>
            </li>
          )}
        </>
      )}
    </ul>
  )
}
