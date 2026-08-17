export type SkillMatch = {
  id: string
  title: string
  match: number
}

export type Sponsor = {
  id: string
  title: string
  domain: string
  image: string
}

/** Suggested roles ranked by profile match. */
export const SKILL_MATCHES: SkillMatch[] = [
  { id: "analyst", title: "Продуктовый аналитик", match: 64 },
  { id: "pm", title: "Менеджер проектов", match: 56 },
  { id: "owner", title: "Владелец продукта", match: 74 },
]

/** Sponsored placements. */
export const SPONSORS: Sponsor[] = [
  {
    id: "intermigro",
    title: "Начните новую жизнь в Германии!",
    domain: "intermigro.com",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=192&h=192&fit=crop&auto=format",
  },
  {
    id: "cryptomus",
    title: "Cryptomus Crypto Payment Gateway",
    domain: "cryptomus.com",
    image:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=192&h=192&fit=crop&auto=format",
  },
]

export const USER_ACTIVITY = 70
