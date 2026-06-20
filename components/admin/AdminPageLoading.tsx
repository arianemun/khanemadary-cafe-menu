import { Skeleton } from "@/components/ui/skeleton";

const SIDEBAR_SKELETON = "bg-white/10";
const CONTENT_SKELETON = "bg-[var(--admin-border)]";

export function AdminPageLoading() {
  return (
    <div
      className="flex min-h-screen bg-[var(--admin-bg)] text-sm"
      aria-busy="true"
      aria-label="Loading admin panel"
    >
      <aside className="hidden w-64 shrink-0 border-e border-white/[0.06] bg-[var(--admin-sidebar)] p-4 lg:block">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-6">
          <Skeleton className={`size-10 rounded-xl ${SIDEBAR_SKELETON}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={`h-4 w-28 ${SIDEBAR_SKELETON}`} />
            <Skeleton className={`h-3 w-20 ${SIDEBAR_SKELETON}`} />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={`h-9 w-full rounded-md ${SIDEBAR_SKELETON}`} />
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 sm:h-16 sm:px-6">
          <Skeleton className={`h-9 w-9 rounded-md lg:hidden ${CONTENT_SKELETON}`} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={`h-5 w-36 ${CONTENT_SKELETON}`} />
            <Skeleton className={`hidden h-3 w-52 sm:block ${CONTENT_SKELETON}`} />
          </div>
          <Skeleton className={`h-9 w-28 rounded-md ${CONTENT_SKELETON}`} />
        </div>

        <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-6 p-4 sm:p-6">
          <Skeleton className={`h-24 w-full rounded-xl ${CONTENT_SKELETON}`} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className={`h-24 rounded-xl ${CONTENT_SKELETON}`} />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-5">
            <Skeleton className={`h-72 rounded-xl lg:col-span-3 ${CONTENT_SKELETON}`} />
            <Skeleton className={`h-72 rounded-xl lg:col-span-2 ${CONTENT_SKELETON}`} />
          </div>
        </main>
      </div>
    </div>
  );
}
