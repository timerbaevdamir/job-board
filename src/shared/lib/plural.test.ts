import { describe, expect, it } from "vitest"
import { plural, vacancies } from "./plural"

const forms = { one: "вакансия", few: "вакансии", many: "вакансий" }

describe("plural", () => {
  it("picks the form by the last digit", () => {
    expect(plural(1, forms)).toBe("вакансия")
    expect(plural(2, forms)).toBe("вакансии")
    expect(plural(5, forms)).toBe("вакансий")
    expect(plural(21, forms)).toBe("вакансия")
    expect(plural(22, forms)).toBe("вакансии")
    expect(plural(25, forms)).toBe("вакансий")
  })

  it("handles the teens, which break the last-digit rule", () => {
    expect(plural(11, forms)).toBe("вакансий")
    expect(plural(12, forms)).toBe("вакансий")
    expect(plural(14, forms)).toBe("вакансий")
    expect(plural(111, forms)).toBe("вакансий")
    expect(plural(112, forms)).toBe("вакансий")
  })

  it("uses the many form for zero", () => {
    expect(plural(0, forms)).toBe("вакансий")
  })

  it("vacancies() is the same rule, pre-filled", () => {
    expect(vacancies(1)).toBe("вакансия")
    expect(vacancies(13)).toBe("вакансий")
    expect(vacancies(102)).toBe("вакансии")
  })
})
