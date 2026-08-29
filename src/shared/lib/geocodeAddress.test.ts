import { describe, expect, it } from "vitest"
import {
  fallbackCoords,
  normalizeAddress,
  normalizeMapboxToken,
} from "./geocodeAddress"

describe("normalizeMapboxToken", () => {
  it("strips a doubled pk. prefix", () => {
    expect(normalizeMapboxToken("pk.pk.eyJexample")).toBe("pk.eyJexample")
  })

  it("leaves a normal public token alone", () => {
    expect(normalizeMapboxToken("pk.eyJexample")).toBe("pk.eyJexample")
  })

  it("trims whitespace and rejects empty values", () => {
    expect(normalizeMapboxToken("  pk.eyJexample  ")).toBe("pk.eyJexample")
    expect(normalizeMapboxToken("")).toBeUndefined()
    expect(normalizeMapboxToken("   ")).toBeUndefined()
  })
})

describe("normalizeAddress", () => {
  it("turns the middle-dot city prefix into a comma", () => {
    expect(normalizeAddress("Москва · Льва Толстого, дом 16")).toBe(
      "Москва, Льва Толстого, дом 16",
    )
  })
})

describe("fallbackCoords", () => {
  it("pins Льва Толстого 16 at the Yandex campus", () => {
    expect(fallbackCoords("Москва · Льва Толстого, дом 16")).toEqual({
      lng: 37.5881,
      lat: 55.7338,
    })
  })

  it("does not invent coords for other offices", () => {
    expect(fallbackCoords("Москва · Маршала Шевченко, дом 88")).toBeNull()
  })
})
