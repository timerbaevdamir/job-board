import { useCallback, useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { JobDetail } from "@/entities/job"
import {
  geocodeAddress,
  hasMapboxToken,
  mapboxAccessToken,
} from "@/shared/lib/geocodeAddress"
import { ExpandIcon, MapPinIcon } from "@/shared/ui/icons"
import { useTheme, type Theme } from "@/features/theme"
import { SectionHeading } from "./primitives"

type Metro = NonNullable<JobDetail["metro"]>

/** One style per theme; the map rebuilds when the choice flips. */
const MAP_STYLE: Record<Theme, string> = {
  light: "https://api.mapbox.com/styles/v1/mapbox/streets-v12",
  dark: "https://api.mapbox.com/styles/v1/mapbox/dark-v11",
}

function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function pinColor(): string {
  const token = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-info")
    .trim()
  return token || "#0070ff"
}

const PIN_NS = "http://www.w3.org/2000/svg"

/** Mapbox's default teardrop bakes a white rim into the SVG. Same 27×41
 *  size and drop, solid fill, no stroke. */
function createPinElement(color: string): HTMLDivElement {
  const el = document.createElement("div")
  el.className = "address-map-pin"
  el.setAttribute("aria-hidden", "true")

  const svg = document.createElementNS(PIN_NS, "svg")
  svg.setAttribute("width", "27")
  svg.setAttribute("height", "41")
  svg.setAttribute("viewBox", "0 0 27 41")

  const pin = document.createElementNS(PIN_NS, "path")
  pin.setAttribute(
    "d",
    "M13.5 0C6.044 0 0 6.044 0 13.5 0 23.4 13.5 41 13.5 41S27 23.4 27 13.5C27 6.044 20.956 0 13.5 0z",
  )
  pin.setAttribute("fill", color)

  const hole = document.createElementNS(PIN_NS, "circle")
  hole.setAttribute("cx", "13.5")
  hole.setAttribute("cy", "13.5")
  hole.setAttribute("r", "4.5")
  hole.setAttribute("fill", "#fff")

  svg.append(pin, hole)
  el.append(svg)
  return el
}

function redact(text: string): string {
  return text.replace(/access_token=[^&\s]+/gi, "access_token=[redacted]")
}

function warnMapboxError(error: unknown) {
  const err = error as { status?: number; message?: string } | undefined
  const status = err?.status
  const message = redact(String(err?.message ?? ""))
  if (status === 401 || status === 403) {
    console.warn(
      `Mapbox style/tiles HTTP ${status}: включите Styles и Tiles у токена. Если ограничены URL — добавьте и localhost, и 127.0.0.1.`,
    )
    return
  }
  if (message) console.warn("Mapbox map error:", message)
}

function ExpandControl({ address }: { address: string }) {
  return (
    <a
      href={mapsSearchUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Открыть карту"
      className="absolute right-3 top-3 z-10 hidden size-9 items-center justify-center rounded-lg bg-surface text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-surface-muted md:flex"
    >
      <ExpandIcon className="size-4" />
    </a>
  )
}

function StaticMap({ src }: { src: string }) {
  return (
    <>
      <img
        src={src}
        alt="Карта расположения офиса"
        className="h-44 w-full object-cover"
      />
      <span className="pointer-events-none absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-full items-center justify-center">
        <MapPinIcon
          className="size-8 text-info drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
          fill="currentColor"
          strokeWidth={1.5}
        />
        <span className="absolute left-1/2 top-[38%] size-2.5 -translate-x-1/2 rounded-full bg-white" />
      </span>
    </>
  )
}

function LiveMap({
  address,
  styleUrl,
  onFail,
}: {
  address: string
  styleUrl: string
  onFail: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onFailRef = useRef(onFail)
  onFailRef.current = onFail

  useEffect(() => {
    const node = containerRef.current
    const token = mapboxAccessToken()
    if (!node || !token) {
      onFailRef.current()
      return
    }

    let cancelled = false
    let map: mapboxgl.Map | undefined
    let marker: mapboxgl.Marker | undefined
    let ro: ResizeObserver | undefined

    void (async () => {
      const coords = await geocodeAddress(address)
      if (cancelled) return
      if (!coords) {
        onFailRef.current()
        return
      }

      mapboxgl.accessToken = token
      const instance = new mapboxgl.Map({
        accessToken: token,
        container: node,
        style: styleUrl,
        center: [coords.lng, coords.lat],
        zoom: 16,
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: true,
        transformRequest(url) {
          if (
            /(?:api|tiles)\.mapbox\.com/.test(url) &&
            !url.includes("access_token=")
          ) {
            return {
              url: `${url}${url.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`,
            }
          }
          return { url }
        },
      })
      map = instance

      marker = new mapboxgl.Marker({
        element: createPinElement(pinColor()),
        anchor: "bottom",
      })
        .setLngLat([coords.lng, coords.lat])
        .addTo(instance)

      const resize = () => {
        if (cancelled) return
        instance.resize()
      }
      instance.on("load", () => {
        resize()
        requestAnimationFrame(resize)
      })
      instance.on("error", (event) => warnMapboxError(event.error))

      ro = new ResizeObserver(resize)
      ro.observe(node)
    })()

    return () => {
      cancelled = true
      ro?.disconnect()
      marker?.remove()
      map?.remove()
    }
  }, [address, styleUrl])

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Карта расположения офиса"
      className="address-map h-44 w-full bg-surface-muted"
    />
  )
}

/** Single map-address card: live Mapbox (or a still fallback) + expand + footer. */
export function AddressMap({
  address,
  mapImage,
  metro,
}: {
  address: string
  mapImage?: string
  metro?: Metro
}) {
  const [liveFailed, setLiveFailed] = useState(false)
  const onLiveFail = useCallback(() => setLiveFailed(true), [])
  const { theme } = useTheme()
  const showLive = hasMapboxToken() && !liveFailed

  useEffect(() => {
    setLiveFailed(false)
  }, [address])

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Адрес</SectionHeading>
      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="relative overflow-hidden">
          {showLive ? (
            <LiveMap
              address={address}
              styleUrl={MAP_STYLE[theme]}
              onFail={onLiveFail}
            />
          ) : mapImage ? (
            <StaticMap src={mapImage} />
          ) : (
            <div
              role="img"
              aria-label="Карта расположения офиса"
              className="flex h-44 w-full items-center justify-center bg-surface-muted text-sm text-muted"
            >
              Карта недоступна
            </div>
          )}
          <ExpandControl address={address} />
        </div>
        <div className="flex flex-col gap-1 p-4 md:p-6">
          <p className="text-sm leading-5 text-foreground">{address}</p>
          {metro && metro.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-5">
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: metro[0].color }}
              />
              <span className="text-foreground">{metro[0].station}</span>
              {metro.length > 1 && (
                <>
                  <span className="text-muted">и ещё {metro.length - 1}</span>
                  <span className="ml-0.5 flex items-center gap-1">
                    {metro.slice(1).map((m) => (
                      <span
                        key={m.station}
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    ))}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
