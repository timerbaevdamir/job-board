/**
 * A single choice inside a filter popover. `counter` is not part of the
 * catalog: how many vacancies an option yields depends on the current query and
 * the other active filters, so it's computed per render (see `countOptions`)
 * and attached to the options handed to the popover.
 */
export type FilterOption = { id: string; label: string; counter?: number }

/**
 * A filter chip backed by a popover. `multi` filters allow several options
 * (checkboxes); the rest are single-select (radio).
 *
 * This is the *catalog* — the filters that exist and what they offer. Which
 * options are currently chosen lives in the search state (see the job-search
 * feature's store) as a `FilterSelection`, so the query params stay in one
 * place instead of being split between the bar's local state and the request.
 */
/**
 * Every filter the catalog knows. A closed union on purpose: the search engine
 * keys its predicates by exactly this type, so adding a filter here without
 * teaching the engine what it means is a compile error rather than a filter
 * that renders, counts, and quietly matches everything.
 */
export type FilterId = "schedule" | "income" | "recency" | "experience" | "format" | "employment" | "extras"

export type Filter = {
  id: FilterId
  /** Neutral category name, shown on the chip when nothing is selected. */
  label: string
  multi?: boolean
  /**
   * How several chosen options combine. `any` (the default) widens the search —
   * "полный день или гибкий". `all` narrows it: each checked box is another
   * requirement, which is what independent yes/no properties mean.
   */
  combine?: "any" | "all"
  /**
   * `false` keeps the filter out of the chip strip — it exists only inside the
   * full-filters drawer. The chips are the shortlist; the drawer is the whole
   * catalog, so both read from this one list rather than diverging.
   */
  chip?: boolean
  options: FilterOption[]
}

/** Chosen option ids per filter id; a filter is "active" when its list is non-empty. */
export type FilterSelection = Partial<Record<FilterId, string[]>>

/** The job-search filter catalog. Ordering is the default chip priority. */
export const FILTERS: Filter[] = [
  {
    id: "schedule",
    label: "График работы",
    multi: true,
    options: [
      { id: "full-day", label: "Полный день" },
      { id: "shift", label: "Сменный график" },
      { id: "flex", label: "Гибкий график" },
      { id: "remote", label: "Удалённая работа" },
      { id: "rotational", label: "Вахтовый метод" },
    ],
  },
  {
    id: "income",
    label: "Уровень дохода",
    options: [
      { id: "80", label: "от 80 000 ₽" },
      { id: "120", label: "от 120 000 ₽" },
      { id: "180", label: "от 180 000 ₽" },
      { id: "250", label: "от 250 000 ₽" },
      { id: "350", label: "от 350 000 ₽" },
    ],
  },
  {
    id: "recency",
    label: "Дата публикации",
    options: [
      { id: "all", label: "За всё время" },
      { id: "month", label: "За месяц" },
      { id: "week", label: "За неделю" },
      { id: "3d", label: "За 3 дня" },
      { id: "today", label: "За сегодня" },
    ],
  },
  {
    id: "experience",
    label: "Опыт работы",
    options: [
      { id: "none", label: "Нет опыта" },
      { id: "1-3", label: "От 1 года до 3 лет" },
      { id: "3-6", label: "От 3 до 6 лет" },
      { id: "6", label: "Более 6 лет" },
    ],
  },
  {
    id: "format",
    label: "Формат работы",
    multi: true,
    options: [
      { id: "office", label: "В офисе" },
      { id: "remote", label: "Удалённо" },
      { id: "hybrid", label: "Гибрид" },
    ],
  },
  {
    id: "employment",
    label: "Тип занятости",
    multi: true,
    options: [
      { id: "full", label: "Полная занятость" },
      { id: "part", label: "Частичная занятость" },
      { id: "project", label: "Проектная работа" },
      { id: "intern", label: "Стажировка" },
    ],
  },
  {
    id: "extras",
    label: "Дополнительно",
    multi: true,
    // Independent properties of a vacancy: ticking two means "both", not
    // "either" — the opposite of how the categories above combine.
    combine: "all",
    chip: false,
    options: [
      { id: "with-salary", label: "Только с указанным доходом" },
      { id: "verified", label: "Проверенная компания" },
      { id: "it-accredited", label: "Аккредитованная IT-компания" },
      { id: "from-home", label: "Можно работать из дома" },
    ],
  },
]

/** Filters shown as chips in the search field — the shortlist. */
export const CHIP_FILTERS: Filter[] = FILTERS.filter((f) => f.chip !== false)

/**
 * A fresh session starts with nothing filtered: the first search should show
 * everything that matches the query, and narrowing is the user's call. Any
 * preselected filter silently hides results the user never asked to exclude.
 */
export const INITIAL_SELECTION: FilterSelection = {}

/**
 * When the in-field filter drawer is revealed.
 *
 * - `always` — the bar is part of the search field from the start, so a user
 *   can narrow the feed without typing anything first.
 * - `with-query` — the bar unfurls once a query is committed, treating filters
 *   as a refinement of a search rather than a way to browse.
 *
 * This is a single switch on purpose: both paths run through the search field's
 * one animated body height, so the reveal animation is intact either way and
 * flipping the value is all it takes to go back.
 */
export const FILTERS_REVEAL: "always" | "with-query" = "always"
