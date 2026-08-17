import { cn } from "@/shared/lib/cn"

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-chip", className)} />
}

/**
 * Loading placeholder mirroring {@link JobCard}'s layout (logo tile, title +
 * salary, company lines, tag row, description, action buttons), so the feed
 * keeps its rhythm while the prototype's simulated search request is in
 * flight and the swap to real cards doesn't shift the page.
 */
export function JobCardSkeleton() {
  return (
    <article
      aria-hidden
      className="relative flex flex-col gap-6 rounded-3xl border border-border-strong/70 bg-surface p-6"
    >
      <div className="absolute right-6 top-6">
        <Bone className="size-[60px] rounded-xl" />
      </div>

      <div className="flex flex-col gap-5 pr-[72px]">
        <div className="flex flex-col gap-2">
          <Bone className="h-[26px] w-3/5" />
          <Bone className="h-[26px] w-32" />
        </div>

        <div className="flex flex-col gap-1">
          <Bone className="h-5 w-44" />
          <Bone className="h-5 w-24" />
        </div>

        <div className="flex gap-2">
          <Bone className="h-7 w-32" />
          <Bone className="h-7 w-28" />
        </div>

        <div className="flex flex-col gap-2">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Bone className="h-10 w-36 rounded-full" />
        <Bone className="h-10 w-28 rounded-full" />
      </div>
    </article>
  )
}
