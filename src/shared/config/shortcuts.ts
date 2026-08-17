import type { ComponentType, SVGProps } from "react"
import {
  BellIcon,
  BuildingIcon,
  EyeIcon,
  FileTextIcon,
  LightbulbIcon,
  MapIcon,
  RocketIcon,
  RubleIcon,
  TargetIcon,
  TrendingUpIcon,
} from "@/shared/ui/icons"

export type Shortcut = {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

/** Quick-action cards shown above the job feed, revealed a page at a time. */
export const SHORTCUTS: Shortcut[] = [
  { id: "map", label: "Вакансии на карте", icon: MapIcon },
  { id: "public", label: "Сделать профиль публичным", icon: EyeIcon },
  { id: "salary", label: "Сравнить зарплату с рынком", icon: RubleIcon },
  {
    id: "high-salary",
    label: "Вакансии с высокой зарплатой",
    icon: TrendingUpIcon,
  },
  { id: "improve", label: "Как улучшить профиль?", icon: LightbulbIcon },
  { id: "resume", label: "Составить сильное резюме", icon: FileTextIcon },
  { id: "alerts", label: "Настроить уведомления", icon: BellIcon },
  { id: "skills", label: "Востребованные навыки", icon: RocketIcon },
  { id: "companies", label: "Топ компаний", icon: BuildingIcon },
  { id: "interview", label: "Подготовиться к собеседованию", icon: TargetIcon },
]
