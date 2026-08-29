import type { ComponentType, SVGProps } from "react"
import {
  BellIcon,
  EyeIcon,
  FileTextIcon,
  RubleIcon,
  SparklesIcon,
  SupportIcon,
  TargetIcon,
} from "@/shared/ui/icons"

export type Recommendation = {
  id: string
  label: string
  /** Optional supporting line — shown only when it adds context. */
  subtitle?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Accent icon tint — paid services stand out with a coloured icon. */
  iconColor?: string
  /** Accent call-to-action line (e.g. price) — services only. */
  cta?: string
}

/**
 * Personalised suggestions for the seeker. Plain items are free profile tips;
 * items with {@link Recommendation.iconColor}/{@link Recommendation.cta} are paid
 * services and read with an accent icon + accent trigger. The first
 * {@link RECOMMENDATIONS_VISIBLE} are shown; the rest hide behind "Развернуть".
 */
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "portfolio",
    label: "Добавьте ссылку на портфолио",
    subtitle: "Дизайнеров без портфолио смотрят реже",
    icon: FileTextIcon,
  },
  {
    id: "salary",
    label: "Укажите желаемую зарплату",
    subtitle: "Отклик приходит на 40% чаще",
    icon: RubleIcon,
  },
  {
    id: "skills",
    label: "Добавьте ключевые навыки",
    subtitle: "Так вас находят чаще по нужным вакансиям",
    icon: TargetIcon,
  },
  {
    id: "profile-public",
    label: "Сделайте профиль публичным",
    subtitle: "Работодатели найдут вас первыми",
    icon: EyeIcon,
  },
  {
    id: "alerts",
    label: "Настройте оповещения по Product Design",
    subtitle: "Не пропустить новые вакансии",
    icon: BellIcon,
  },
  {
    id: "resume-service",
    label: "Улучшить своё резюме",
    subtitle: "Получите совет от эксперта",
    cta: "всего за 799 ₽",
    icon: SparklesIcon,
    iconColor: "var(--color-info)",
  },
  {
    id: "interview-service",
    label: "Репетиция собеседования",
    subtitle: "Подготовьтесь к интервью вместе с экспертом",
    cta: "всего за 1 490 ₽",
    icon: SupportIcon,
    iconColor: "#ff9900",
  },
]

export const RECOMMENDATIONS_VISIBLE = 3
