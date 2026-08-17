import type { ComponentType, SVGProps } from "react"
import {
  BellIcon,
  HeartIcon,
  MailIcon,
  SearchIcon,
  UserIcon,
} from "@/shared/ui/icons"

export type NavItem = {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Numeric badge shown as a filled pill (accent) or a muted count. */
  count?: number
  countStyle?: "accent" | "muted"
  /** Small dot indicator for unread/new activity. */
  dot?: boolean
}

/** Primary navigation for the job board. Ordering mirrors the imported design. */
export const PRIMARY_NAV: NavItem[] = [
  { id: "search", label: "Поиск", icon: SearchIcon },
  {
    id: "appeals",
    label: "Отклики",
    icon: MailIcon,
    count: 2,
    countStyle: "accent",
  },
  {
    id: "saved",
    label: "Сохранённые",
    icon: HeartIcon,
    count: 35,
    countStyle: "muted",
  },
  { id: "activity", label: "Активность", icon: BellIcon, dot: true },
  { id: "profile", label: "Профиль", icon: UserIcon },
]
