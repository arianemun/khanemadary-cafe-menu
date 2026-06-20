import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginLoading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)] p-4"
      aria-busy="true"
      aria-label="Loading login"
    >
      <div className="w-full max-w-md rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-32 bg-[var(--admin-border)]" />
          <Skeleton className="h-9 w-[8.5rem] rounded-md bg-[var(--admin-border)]" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16 bg-[var(--admin-border)]" />
            <Skeleton className="h-10 w-full rounded-md bg-[var(--admin-border)]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-[var(--admin-border)]" />
            <Skeleton className="h-10 w-full rounded-md bg-[var(--admin-border)]" />
          </div>
          <Skeleton className="h-10 w-full rounded-md bg-[var(--admin-border)]" />
        </div>
      </div>
    </div>
  );
}
