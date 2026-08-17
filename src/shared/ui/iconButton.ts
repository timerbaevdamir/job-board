/**
 * A quiet round icon button: no fill at rest, the neutral chip fill on hover.
 *
 * The dismissing controls — clear a search, close a drawer, close a sheet — are
 * one control wearing one look, and they had drifted into two: the drawers'
 * closes at 36px with the `chip` token, the search's clears at 24px with a raw
 * `black/6%`. Beside the sheet's «Отмена», which is the same object with a word
 * in it instead of a glyph, the small one read as a different kind of thing.
 *
 * 36px is also the smallest a target should be for a finger, which the 24px
 * version was not.
 */
export const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-subtle transition-colors hover:bg-chip hover:text-foreground"
