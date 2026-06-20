import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SectionVerticalDivider } from "./SectionVerticalDivider";

function CategoryTabSkeleton() {
  return (
    <div className="flex h-full shrink-0 flex-col items-start justify-center gap-1 px-3">
      <Skeleton className="h-3.5 w-16 bg-muted" />
      <Skeleton className="h-3 w-12 bg-muted" />
    </div>
  );
}

function CategoryTileSkeleton({
  tall = false,
  className,
}: {
  tall?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-muted",
        tall ? "min-h-[300px] sm:min-h-[340px]" : "min-h-[148px] sm:min-h-[168px]",
        className
      )}
    >
      <div className="shrink-0 px-3 pb-1 pt-3">
        <Skeleton className="h-3.5 w-20 bg-secondary-text/20" />
        <Skeleton className="mt-1.5 h-3 w-14 bg-secondary-text/15" />
      </div>
      <div className="flex flex-1 items-end justify-center px-2 pb-2">
        <Skeleton
          className={cn(
            "rounded-card bg-secondary-text/15",
            tall ? "h-40 w-32 sm:h-48 sm:w-36" : "h-20 w-24 sm:h-24 sm:w-28"
          )}
        />
      </div>
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <section className="w-full bg-card pt-10">
      <div className="grid grid-cols-2 grid-rows-2 gap-0">
        <CategoryTileSkeleton tall className="col-start-1 row-span-2 row-start-1" />
        <CategoryTileSkeleton />
        <CategoryTileSkeleton />
      </div>
    </section>
  );
}

function MenuItemRowSkeleton({ odd }: { odd?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-[150px] w-full items-center gap-4 px-4 py-4",
        odd ? "bg-muted" : "bg-card"
      )}
    >
      <Skeleton className="h-28 w-28 shrink-0 rounded-card bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-0.5">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <Skeleton className="h-px w-full bg-border" />
        <Skeleton className="h-3 w-1/2 bg-muted" />
      </div>
      <Skeleton className="h-4 w-14 shrink-0 bg-muted" />
    </div>
  );
}

export function MenuLoading() {
  return (
    <div
      className="flex min-h-screen flex-col bg-background"
      aria-busy="true"
      aria-label="Loading menu"
    >
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-card toolbar-height">
        <div className="mx-auto flex h-full max-w-web items-center gap-x-2 px-4" dir="ltr">
          <Skeleton className="size-11 shrink-0 rounded-full bg-muted" />
          <div className="min-w-0 flex-1" />
          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="size-8 rounded-full bg-muted" />
            <Skeleton className="size-11 rounded-btn bg-muted" />
          </div>
        </div>
      </header>

      <section className="hero-viewport-height relative w-full bg-muted">
        <div className="absolute inset-0 bg-secondary-text/10" />
        <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-web flex-col items-stretch px-4 pb-20 pt-4">
          <div className="mt-auto flex flex-col items-start gap-3">
            <Skeleton className="size-20 shrink-0 rounded-full bg-secondary-text/20" />
            <Skeleton className="h-8 w-48 max-w-[70%] bg-secondary-text/20" />
            <Skeleton className="h-4 w-32 max-w-[50%] bg-secondary-text/15" />
          </div>
        </div>
      </section>

      <nav
        aria-hidden
        className="sticky-below-toolbar w-full self-start border-b border-border bg-card category-tabs-height"
      >
        <div className="flex h-full w-full items-center">
          <Skeleton className="mx-2 h-4 w-4 shrink-0 rounded bg-muted" />
          <div className="flex h-full min-w-0 flex-1 items-center gap-6 overflow-hidden px-1">
            {Array.from({ length: 5 }, (_, i) => (
              <CategoryTabSkeleton key={i} />
            ))}
          </div>
          <Skeleton className="mx-2 h-4 w-4 shrink-0 rounded bg-muted" />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-web flex-1">
        <CategoryGridSkeleton />

        <div className="py-10">
          <div className="mx-auto flex h-[60px] w-full max-w-web items-center gap-3 px-4">
            <Skeleton className="size-2.5 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36 bg-muted" />
              <Skeleton className="h-3 w-52 max-w-full bg-muted" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0 bg-muted" />
          </div>
        </div>

        <div className="bg-card px-4 py-6 text-center">
          <Skeleton className="mx-auto h-7 w-40 bg-muted" />
          <Skeleton className="mx-auto mt-2 h-4 w-28 bg-muted" />
        </div>

        {Array.from({ length: 4 }, (_, i) => (
          <MenuItemRowSkeleton key={i} odd={i % 2 === 1} />
        ))}

        <SectionVerticalDivider />

        <div className="bg-card px-4 py-6 text-center">
          <Skeleton className="mx-auto h-7 w-36 bg-muted" />
          <Skeleton className="mx-auto mt-2 h-4 w-24 bg-muted" />
        </div>

        {Array.from({ length: 2 }, (_, i) => (
          <MenuItemRowSkeleton key={`cat-2-${i}`} odd={i % 2 === 1} />
        ))}

        <div className="flex justify-center py-10">
          <Skeleton className="h-48 w-[280px] rounded-card bg-muted" />
        </div>

        <SectionVerticalDivider />

        <div className="bg-card px-4 py-6 text-center">
          <Skeleton className="mx-auto h-7 w-32 bg-muted" />
          <Skeleton className="mx-auto mt-2 h-4 w-24 bg-muted" />
        </div>
        <div className="bg-card px-4 pb-section">
          <div className="space-y-3">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-card bg-muted" />
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-auto px-4 pb-6 pt-4 text-center">
        <Skeleton className="mx-auto h-3 w-56 bg-muted" />
      </footer>
    </div>
  );
}
