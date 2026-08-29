export type LngLat = { lng: number; lat: number }

/** Yandex campus at Льва Толстого, 16 — used when geocoding that address fails. */
const TOLSTOY_16: LngLat = { lng: 37.5881, lat: 55.7338 }

const cache = new Map<string, Promise<LngLat | null>>()

/**
 * Public tokens are `pk.ey…`. A doubled `pk.` prefix is a common copy-paste
 * miss: the map still mounts (logo + pin) while style/tiles 401.
 */
export function normalizeMapboxToken(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/^(pk\.)+/, "pk.")
}

export function mapboxAccessToken(): string | undefined {
  const raw = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  const token = normalizeMapboxToken(raw)
  if (typeof raw === "string" && token && raw.trim() !== token) {
    console.warn(
      "VITE_MAPBOX_ACCESS_TOKEN: лишний префикс pk. убран. В .env должно быть pk.ey… (один раз).",
    )
  }
  return token
}

export function hasMapboxToken(): boolean {
  return Boolean(mapboxAccessToken())
}

/** Turn "Москва · улица, дом N" into something the geocoder accepts. */
export function normalizeAddress(address: string): string {
  return address.replace(/\s*·\s*/g, ", ").trim()
}

export function fallbackCoords(address: string): LngLat | null {
  if (/Льва Толстого/i.test(address) && /(?:дом\s*)?16\b/.test(address)) {
    return TOLSTOY_16
  }
  return null
}

/**
 * Geocode once per address string (module-memory cache). Returns null when
 * there is no token and no hardcoded fallback, so the map can stay a still.
 */
export function geocodeAddress(address: string): Promise<LngLat | null> {
  const hit = cache.get(address)
  if (hit) return hit

  const pending = lookup(address)
  cache.set(address, pending)
  return pending
}

async function lookup(address: string): Promise<LngLat | null> {
  const token = mapboxAccessToken()
  if (!token) return fallbackCoords(address)

  try {
    const query = encodeURIComponent(normalizeAddress(address))
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
      `?access_token=${encodeURIComponent(token)}&limit=1&language=ru&country=RU`
    const res = await fetch(url)
    if (res.ok) {
      const data: { features?: { center?: [number, number] }[] } =
        await res.json()
      const center = data.features?.[0]?.center
      if (center && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
        return { lng: center[0], lat: center[1] }
      }
    }
  } catch {
    // Network / parse — fall through to the hardcoded pin.
  }

  return fallbackCoords(address)
}
