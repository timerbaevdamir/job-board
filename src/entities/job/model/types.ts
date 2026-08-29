export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship"
export type WorkMode = "Remote" | "Hybrid" | "On-site"
/** Work-schedule ids, mirroring the `schedule` filter's options. */
export type Schedule = "full-day" | "shift" | "flex" | "remote" | "rotational"

export type Job = {
  id: string
  title: string
  /** Optional salary line shown under the title. */
  salary?: string
  /**
   * Lower bound of {@link salary} in ₽, for filtering and sorting. Absent when
   * the vacancy doesn't disclose pay — those drop out of salary-bounded
   * searches, the way a real board treats "зарплата не указана".
   */
  salaryFrom?: number
  company: string
  /** Single-letter fallback shown in the logo tile. */
  companyInitial: string
  /** Brand tint for the logo tile background. */
  logoBg: string
  verified: boolean
  /** IT-accreditation mark; used by filters, not shown on the card. */
  itAccredited?: boolean
  online: boolean
  location: string
  /** e.g. "Опыт от 3 до 6 лет" / "Experience from 3 to 6 years". */
  experience?: string
  /** Required years of experience, as a range; `experienceTo` open = "и более". */
  experienceFrom: number
  experienceTo?: number
  /** Renders the purple "remote allowed" tag. */
  remoteAllowed?: boolean
  /** 0–100 profile match; renders the bordered "N% match" tag. */
  matchPercent?: number
  workMode: WorkMode
  type: JobType
  /** Work schedules this vacancy offers — a vacancy can match several. */
  schedule: Schedule[]
  /** Human-readable posting age, e.g. "2 часа назад". */
  postedAt: string
  /** {@link postedAt} in hours, for recency filtering and date sorting. */
  postedHoursAgo: number
  /** Description paragraphs (truncated in the card, full in the panel). */
  description: string[]
  tags: string[]
  saved: boolean
  /** Rich content for the full vacancy view; optional, the view degrades without it. */
  detail?: JobDetail
}

export type JobSection = {
  heading: string
  items: string[]
}

export type JobReview = {
  id: string
  author: string
  date: string
  rating: number
  text: string
}

/** Icon treatment for a {@link JobDetail.properties} row. */
export type JobPropertyKind = "verified" | "it" | "open" | "rating" | "award"

/** A company-card mark: title, optional supporting line, and which glyph to show. */
export type JobProperty = {
  kind: JobPropertyKind
  label: string
  sublabel?: string
}

export type JobDetail = {
  /** Company rating, 0–5. */
  rating?: number
  reviewsCount?: number
  /** Share of reviewers who recommend the employer, 0–100. */
  recommendPercent?: number
  /** Label/value spec rows shown under the salary (experience, format, …). */
  specs?: { label: string; value: string }[]
  /**
   * Employer marks on the company card. A row always has a {@link JobProperty.label};
   * {@link JobProperty.sublabel} is optional context under it.
   */
  properties?: JobProperty[]
  /** Leading paragraph shown right under the header. */
  intro?: string
  /** Titled bullet blocks — "Мы предлагаем", "Обязанности", etc. */
  sections?: JobSection[]
  skills?: string[]
  address?: string
  mapImage?: string
  /** Nearby metro stations; `color` is the line's hex used for the marker dot. */
  metro?: { station: string; color: string }[]
  contactName?: string
  /** Role of the contact person, e.g. "HR-менеджер". */
  contactRole?: string
  reviews?: JobReview[]
}
