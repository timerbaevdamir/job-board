/** Status of an application, shown as a colored badge on the conversation. */
export type AppealStatus = "invitation" | "viewed" | "rejected" | "sent"

export type AppealMessage = {
  id: string
  /** Who sent it: the employer, a named contact, or the candidate. */
  from: "employer" | "contact" | "me"
  /** Optional author name shown above employer/contact messages. */
  author?: string
  /** Job at the company (Рекрутер, HR BP…), opposite the name on incoming. */
  role?: string
  /** Optional bold lead line (e.g. "Приглашение"). */
  title?: string
  text: string
  time: string
  /** Read receipt for the candidate's own messages. */
  read?: boolean
  /** Avatar url for contact messages. */
  avatar?: string
}

export type Appeal = {
  id: string
  /** Vacancy this thread belongs to — opens from the chat info action. */
  jobId: string
  company: string
  /** Single-letter fallback for the logo tile. */
  companyInitial: string
  logoBg: string
  logoColor?: string
  position: string
  status: AppealStatus
  online?: boolean
  /** ISO time of the last presence; shown in the chat header when offline. */
  lastSeen?: string
  lastMessage: string
  lastTime: string
  /** Read receipt shown before the last message preview. */
  lastRead?: boolean
  unread?: boolean
  /** Resume the candidate applied with. */
  resume: string
  messages: AppealMessage[]
  /** Suggested quick replies offered under the thread. */
  quickReplies?: string[]
}

export const APPEAL_STATUS_LABEL: Record<AppealStatus, string> = {
  invitation: "Приглашение",
  viewed: "Просмотрено",
  rejected: "Не готовы",
  sent: "Отправлено",
}
