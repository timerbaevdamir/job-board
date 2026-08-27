import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { filtersVisible } from "@/shared/config/filters"
import { matchSuggestions } from "../lib/matchSuggestions"

export type Overlay = "suggestions" | "empty" | "none" | null

/**
 * Combobox controller for the search field. Owns the uncommitted draft, focus
 * and keyboard navigation across the overlay options.
 *
 * The committed value lives in `query` (drives results); typing only mutates the
 * local draft and commits on Enter / selection, so the feed doesn't churn on
 * every keystroke. History is owned by the search store and passed in, so the
 * field and the store never keep diverging copies of it.
 */
export function useSearchField({
  query,
  onQueryChange,
  pool,
  recommendations,
  history,
}: {
  query: string
  onQueryChange: (value: string) => void
  pool: string[]
  recommendations?: string[]
  history: string[]
}) {
  const [draft, setDraft] = useState(query)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the draft in sync when the committed query changes from outside.
  useEffect(() => setDraft(query), [query])

  const trimmed = draft.trim()

  const suggestions = useMemo(
    () => matchSuggestions(pool, draft),
    [pool, draft],
  )
  const recommended = useMemo(
    () =>
      (recommendations ?? pool).filter((s) => !history.includes(s)).slice(0, 5),
    [recommendations, pool, history],
  )

  const showSuggestions =
    focused && trimmed.length > 0 && suggestions.length > 0
  const showEmpty =
    focused &&
    trimmed.length === 0 &&
    (history.length > 0 || recommended.length > 0)
  // Typed something the pool does not know: keep the overlay open on a compact
  // empty state. Closing it left the card at the last list height with nothing
  // inside — a hollow shrink down onto the filter bar.
  const showNone = focused && trimmed.length > 0 && suggestions.length === 0
  const overlay: Overlay = showSuggestions
    ? "suggestions"
    : showEmpty
      ? "empty"
      : showNone
        ? "none"
        : null
  // Filters stay mounted while the overlay is open — the overlay is opaque and
  // simply covers them, so neither the field nor the feed moves on focus.
  // Whether they show at all is a product decision, kept as one switch.
  const showFilters = filtersVisible(query)

  // Flat, ordered list of navigable options for arrow-key traversal.
  const options = useMemo(
    () =>
      overlay === "suggestions"
        ? suggestions
        : overlay === "empty"
          ? [...history, ...recommended]
          : [],
    [overlay, suggestions, history, recommended],
  )

  // Reset the active option whenever the option set changes.
  useEffect(() => setActiveIndex(-1), [overlay, trimmed])

  const commit = useCallback(
    (value: string) => {
      setDraft(value)
      onQueryChange(value)
      setFocused(false)
      setActiveIndex(-1)
      if (blurTimer.current) clearTimeout(blurTimer.current)
      // Really blur the DOM input. Option rows preventDefault their mousedown to
      // beat the blur teardown, which would otherwise leave the input focused
      // while `focused` is false — a later click then fires no focus event and
      // the overlay can't reopen.
      inputRef.current?.blur()
    },
    [onQueryChange],
  )

  const close = useCallback(() => {
    setFocused(false)
    setActiveIndex(-1)
    if (blurTimer.current) clearTimeout(blurTimer.current)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" && options.length > 0) {
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % options.length)
      } else if (e.key === "ArrowUp" && options.length > 0) {
        e.preventDefault()
        setActiveIndex((i) => (i <= 0 ? options.length - 1 : i - 1))
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && options[activeIndex])
          commit(options[activeIndex])
        else if (trimmed) commit(draft)
      } else if (e.key === "Escape") {
        e.currentTarget.blur()
      }
    },
    [options, activeIndex, commit, trimmed, draft],
  )

  const onFocus = useCallback(() => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setFocused(true)
  }, [])

  const onBlur = useCallback(() => {
    // Delay so a mousedown on an option still registers before teardown.
    blurTimer.current = setTimeout(() => setFocused(false), 120)
  }, [])

  return {
    draft,
    setDraft,
    overlay,
    showFilters,
    suggestions,
    history,
    recommended,
    options,
    activeIndex,
    commit,
    close,
    inputProps: {
      ref: inputRef,
      value: draft,
      onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
      onFocus,
      onBlur,
      onKeyDown,
    },
  }
}
