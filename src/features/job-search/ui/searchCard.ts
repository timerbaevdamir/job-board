/**
 * What makes the search field a card: one surface, one border, one radius, and
 * a clip that holds its contents to that radius.
 *
 * Written once because it is drawn twice — the combobox on a wide screen and
 * the button that opens the sheet on a phone — and the two have already come
 * apart once over exactly this. The clip is the part that does not look
 * load-bearing and is: the filter chips run the full width of the card, so
 * without it they spill past the rounded corners and the card's outline shows
 * through its own contents.
 *
 * Position, shadow and motion are not here. Those genuinely differ: one floats
 * over the feed and grows, the other sits in the flow.
 */
export const SEARCH_CARD =
  "overflow-hidden rounded-[28px] border border-border bg-surface"
