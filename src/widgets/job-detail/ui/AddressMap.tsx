import type { JobDetail } from "@/entities/job"
import { ExpandIcon, MapPinIcon } from "@/shared/ui/icons"
import { SectionHeading } from "./primitives"

type Metro = NonNullable<JobDetail["metro"]>

/** Single map-address card: map image with pin + expand control, then footer. */
export function AddressMap({
  address,
  mapImage,
  metro,
}: {
  address: string
  mapImage?: string
  metro?: Metro
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Адрес</SectionHeading>
      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        {mapImage && (
          <div className="relative overflow-hidden rounded-b-3xl">
            <img
              src={mapImage}
              alt="Карта расположения офиса"
              className="h-44 w-full object-cover"
            />
            {/* Centered location pin */}
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-full items-center justify-center">
              <MapPinIcon
                className="size-8 text-[#2563eb] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
                fill="#2563eb"
                strokeWidth={1.5}
              />
              <span className="absolute left-1/2 top-[38%] size-2.5 -translate-x-1/2 rounded-full bg-white" />
            </span>
            {/* Expand control */}
            <button
              type="button"
              aria-label="Открыть карту"
              className="absolute right-3 top-3 hidden size-9 items-center justify-center rounded-lg bg-white text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-surface-muted md:flex"
            >
              <ExpandIcon className="size-4" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-1 p-6">
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
