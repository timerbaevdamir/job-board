import type { ReactNode } from "react"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { InlineSearch } from "./InlineSearch"
import { MobileSearch } from "./MobileSearch"

/**
 * The search field, in whichever shape the screen calls for.
 *
 * Two implementations rather than one with breakpoints, because they are not
 * the same control at two sizes. The wide one is a combobox: a field that stays
 * put while a panel unfurls beneath it inside the same card, sized to its
 * content, dismissed by clicking away. The narrow one is a button that opens a
 * sheet: the list takes the whole screen, the keyboard has somewhere to go, and
 * it is dismissed with a swipe. Their markup, their state and their dismissal
 * have nothing in common.
 *
 * What they do share is shared properly and in one place — the model
 * (`useSearchField`), the rows (`SuggestionList`), the store. Which is the test
 * for a split like this: two presentations are fine, two *searches* are not.
 *
 * Deciding here rather than in the widget above keeps the choice inside the
 * feature that owns it, the same way the filter chips decide between a popover
 * and a sheet without their bar being told which.
 */
export function SearchField(props: {
  recommendations?: string[]
  /** The in-field filter bar, supplied by the composing widget. */
  filters?: ReactNode
}) {
  return useLayoutMode() === "mobile" ? (
    <MobileSearch {...props} />
  ) : (
    <InlineSearch {...props} />
  )
}
