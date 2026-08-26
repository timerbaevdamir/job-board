import { StarIcon } from "@/shared/ui/icons"

/** Five-star rating with fractional (half) fill. */
export function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="relative inline-block size-4">
            <StarIcon
              className="size-4 text-[#d7dde5]"
              strokeWidth={1.5}
              fill="currentColor"
            />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon
                  className="size-4 text-[#ffb020]"
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

export function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-lg font-semibold leading-[26px] text-foreground">
      {children}
    </h2>
  )
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-6 text-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#c1ccd6]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
