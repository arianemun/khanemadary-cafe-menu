import { AdminShell } from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [itemCount, categoryCount, discountCount] = await Promise.all([
    prisma.menuItem.count(),
    prisma.category.count(),
    prisma.discount.count({ where: { isActive: true } }),
  ]);

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card bg-card p-4 shadow-card">
          <div className="text-3xl font-bold">{itemCount}</div>
          <div className="text-secondary-text">Menu Items</div>
        </div>
        <div className="rounded-card bg-card p-4 shadow-card">
          <div className="text-3xl font-bold">{categoryCount}</div>
          <div className="text-secondary-text">Categories</div>
        </div>
        <div className="rounded-card bg-card p-4 shadow-card">
          <div className="text-3xl font-bold">{discountCount}</div>
          <div className="text-secondary-text">Active Discounts</div>
        </div>
      </div>
    </AdminShell>
  );
}
