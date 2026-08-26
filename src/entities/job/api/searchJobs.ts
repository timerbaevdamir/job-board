import {
  FILTERS,
  type FilterId,
  type FilterSelection,
} from "@/shared/config/filters"
import type { Job } from "../model/types"
import { JOBS } from "./mock"

export type SortId = "match" | "date" | "salary"

/** Sentinel city meaning "don't restrict by location". */
export const ANY_CITY = "Вся Россия"

export type SearchParams = {
  /** Committed query — matched against title, company and tags. */
  query: string
  /** Selected city, or {@link ANY_CITY}. */
  city: string
  filters: FilterSelection
  sort: SortId
}

export type SearchResult = {
  items: Job[]
  total: number
}

/** Recency option id → maximum age in hours. */
const MAX_AGE_HOURS: Record<string, number> = {
  today: 24,
  "3d": 72,
  week: 24 * 7,
  month: 24 * 30,
  all: Infinity,
}

/** Experience option id → the years band it covers, as [min, max]. */
const EXPERIENCE_BAND: Record<string, [number, number]> = {
  none: [0, 0],
  "1-3": [1, 3],
  "3-6": [3, 6],
  "6": [6, Infinity],
}

const FORMAT_BY_WORK_MODE: Record<Job["workMode"], string> = {
  "On-site": "office",
  Remote: "remote",
  Hybrid: "hybrid",
}

const EMPLOYMENT_BY_TYPE: Record<Job["type"], string> = {
  "Full-time": "full",
  "Part-time": "part",
  Contract: "project",
  Internship: "intern",
}

/**
 * Yes/no properties offered by the "Дополнительно" group. They live here rather
 * than in the catalog because they are statements about the data; the catalog
 * only knows their labels.
 */
const EXTRA_PREDICATES: Record<string, (job: Job) => boolean> = {
  "with-salary": (job) => job.salaryFrom !== undefined,
  verified: (job) => job.verified,
  "it-accredited": (job) => job.itAccredited === true,
  "from-home": (job) => job.remoteAllowed === true || job.workMode === "Remote",
}

const norm = (s: string) => s.toLowerCase().trim()

/** Free-text match across the fields a user would expect to search by. */
function matchesQuery(job: Job, query: string): boolean {
  const q = norm(query)
  if (!q) return true
  return [job.title, job.company, job.location, ...job.tags].some((field) =>
    norm(field).includes(q),
  )
}

/**
 * What one option of one filter asserts about a vacancy. Everything else about
 * filtering — whether several options widen or narrow, whether the filter is
 * single- or multi-select — comes from the catalog, so these only have to
 * answer the smallest question: does this job satisfy this one option?
 *
 * Typed as a total record over {@link FilterId}: a filter added to the catalog
 * without an entry here won't compile.
 */
type OptionPredicate = (job: Job, optionId: string) => boolean

const MATCHES: Record<FilterId, OptionPredicate> = {
  schedule: (job, id) => job.schedule.includes(id as Job["schedule"][number]),

  // Undisclosed pay can't satisfy a salary floor.
  income: (job, id) =>
    job.salaryFrom !== undefined && job.salaryFrom >= Number(id) * 1000,

  recency: (job, id) => job.postedHoursAgo <= (MAX_AGE_HOURS[id] ?? Infinity),

  experience: (job, id) => {
    const band = EXPERIENCE_BAND[id]
    if (!band) return true
    const [bandFrom, bandTo] = band
    const jobTo = job.experienceTo ?? Infinity
    // Ranges overlap → the vacancy is reachable at that experience level.
    return job.experienceFrom <= bandTo && jobTo >= bandFrom
  },

  format: (job, id) => FORMAT_BY_WORK_MODE[job.workMode] === id,
  employment: (job, id) => EMPLOYMENT_BY_TYPE[job.type] === id,
  extras: (job, id) => EXTRA_PREDICATES[id]?.(job) ?? true,
}

/**
 * Every active filter must pass — AND across filters. Inside one filter the
 * catalog decides: `any` (the default) means one chosen option is enough, `all`
 * means each is another requirement.
 */
function matchesFilters(job: Job, filters: FilterSelection): boolean {
  return FILTERS.every((filter) => {
    const chosen = filters[filter.id] ?? []
    if (chosen.length === 0) return true
    const test = MATCHES[filter.id]
    return filter.combine === "all"
      ? chosen.every((id) => test(job, id))
      : chosen.some((id) => test(job, id))
  })
}

/** Comparators per sort id; missing values always sink to the bottom. */
const COMPARATORS: Record<SortId, (a: Job, b: Job) => number> = {
  match: (a, b) => (b.matchPercent ?? -1) - (a.matchPercent ?? -1),
  date: (a, b) => a.postedHoursAgo - b.postedHoursAgo,
  salary: (a, b) => (b.salaryFrom ?? -1) - (a.salaryFrom ?? -1),
}

/**
 * A city restricts results to that city — plus every fully remote vacancy,
 * which is open to a candidate wherever they are. That is what a job board
 * means by "Москва": jobs in Moscow and jobs you can do from Moscow.
 */
function matchesCity(job: Job, city: string): boolean {
  if (city === ANY_CITY) return true
  return job.location === city || job.workMode === "Remote"
}

/** Synchronous core of {@link searchJobs} — pure, so it can be unit-tested. */
export function selectJobs({
  query,
  city,
  filters,
  sort,
}: SearchParams): SearchResult {
  const items = JOBS.filter(
    (job) =>
      matchesQuery(job, query) &&
      matchesCity(job, city) &&
      matchesFilters(job, filters),
  ).sort(COMPARATORS[sort])
  return { items, total: items.length }
}

/**
 * How many vacancies each option of `filterId` would yield — the numbers shown
 * next to the options in a filter popover.
 *
 * Faceted, the way a real board counts: every *other* active filter and the
 * current query still apply, but the counted filter's own selection is dropped
 * first. Otherwise a single-select filter would report 0 for every option the
 * user hasn't picked, and a multi-select would only ever count what's already
 * chosen — the numbers have to answer "what do I get if I pick this instead".
 */
export function countOptions(
  base: SearchParams,
  filterId: string,
  optionIds: string[],
): Record<string, number> {
  const others = { ...base.filters, [filterId]: [] }
  const counts: Record<string, number> = {}
  for (const optionId of optionIds) {
    counts[optionId] = selectJobs({
      ...base,
      filters: { ...others, [filterId]: [optionId] },
    }).total
  }
  return counts
}

// Simulated network latency: long enough to read as a real request, short
// enough not to annoy. Randomized so repeated searches don't feel canned.
const MIN_DELAY_MS = 450
const DELAY_JITTER_MS = 350

/**
 * Prototype stand-in for `GET /vacancies`. Filtering and sorting are real — only
 * the transport is faked, so swapping this for `fetch` later leaves the UI and
 * the search state untouched.
 */
export function searchJobs(params: SearchParams): Promise<SearchResult> {
  const result = selectJobs(params)
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(result),
      MIN_DELAY_MS + Math.random() * DELAY_JITTER_MS,
    )
  })
}

/**
 * Phrases offered as type-ahead suggestions — job titles and company names from
 * the catalog, de-duplicated. Lives next to the data it derives from.
 */
export const SUGGESTION_POOL: string[] = Array.from(
  new Set(JOBS.flatMap((j) => [j.title, j.company])),
)

/**
 * Cities the picker pins under {@link ANY_CITY}. The rest of the list is
 * alphabetical; this order is the one a job board actually leads with.
 */
export const POPULAR_CITIES: string[] = [
  "Москва",
  "Санкт-Петербург",
  "Екатеринбург",
  "Новосибирск",
  "Казань",
  "Нижний Новгород",
  "Краснодар",
  "Челябинск",
  "Самара",
  "Уфа",
  "Ростов-на-Дону",
  "Красноярск",
]

const MORE_CITIES: string[] = [
  "Архангельск",
  "Астрахань",
  "Барнаул",
  "Белгород",
  "Брянск",
  "Владивосток",
  "Владимир",
  "Владимирская область",
  "Волгоград",
  "Вологда",
  "Воронеж",
  "Грозный",
  "Иваново",
  "Ижевск",
  "Иркутск",
  "Калининград",
  "Калуга",
  "Кемерово",
  "Киров",
  "Курск",
  "Липецк",
  "Магнитогорск",
  "Махачкала",
  "Набережные Челны",
  "Нижний Тагил",
  "Новокузнецк",
  "Омск",
  "Оренбург",
  "Орёл",
  "Пенза",
  "Пермь",
  "Рязань",
  "Саранск",
  "Саратов",
  "Смоленск",
  "Сочи",
  "Ставрополь",
  "Сургут",
  "Тверь",
  "Тольятти",
  "Томск",
  "Тула",
  "Тюмень",
  "Ульяновск",
  "Хабаровск",
  "Чебоксары",
  "Череповец",
  "Чита",
  "Якутск",
  "Ярославль",
]

const popularSet = new Set(POPULAR_CITIES)

const catalogCities = Array.from(new Set(JOBS.map((j) => j.location))).filter(
  (l) => l !== "Удалённо" && l !== ANY_CITY,
)

const restCities = Array.from(new Set([...MORE_CITIES, ...catalogCities]))
  .filter((c) => !popularSet.has(c))
  .sort((a, b) => a.localeCompare(b, "ru"))

/**
 * Cities the picker offers: {@link ANY_CITY}, then the popular set in that
 * order, then everything else alphabetically. Catalog locations are merged in
 * so a vacancy's city cannot vanish from the list. "Удалённо" is a work format
 * rather than a place — remote vacancies surface under every city anyway.
 */
export const CITIES: string[] = [ANY_CITY, ...POPULAR_CITIES, ...restCities]
