/**
 * Picks the Russian plural form for a count: 1 вакансия, 2 вакансии,
 * 5 вакансий. Russian has three, chosen by the last digit with an exception
 * for the teens — hence the `mod100` guards rather than a plain `mod10`.
 */
export function plural(
  n: number,
  forms: { one: string; few: string; many: string },
): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms.one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few
  return forms.many
}

/** The count this app says most often. */
export const vacancies = (n: number) =>
  plural(n, { one: "вакансия", few: "вакансии", many: "вакансий" })
