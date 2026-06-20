import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardView } from "@/components/admin/DashboardView";
import { getAllSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import {
  isCafeOpenBySchedule,
  type WorkingHoursConfig,
} from "@/lib/working-hours";

export default async function AdminDashboardPage() {
  const [itemCount, categoryCount, discountCount, outOfStockCount, recentItems, allSettings] =
    await Promise.all([
      prisma.menuItem.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.discount.count({ where: { isActive: true } }),
      prisma.menuItem.count({ where: { isAvailable: false } }),
      prisma.menuItem.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { translations: true },
      }),
      getAllSettings(),
    ]);

  const general = (allSettings.general ?? {}) as Record<string, unknown>;
  const contact = (allSettings.contact ?? {}) as Record<string, unknown>;
  const rawWorkingHours = (contact.workingHours ?? {}) as WorkingHoursConfig;
  const forceClosed = general.forceClosed === true;
  const scheduleOpen = isCafeOpenBySchedule(rawWorkingHours);

  return (
    <AdminShell>
      <DashboardView
        itemCount={itemCount}
        categoryCount={categoryCount}
        discountCount={discountCount}
        outOfStockCount={outOfStockCount}
        recentItems={recentItems}
        forceClosed={forceClosed}
        scheduleOpen={scheduleOpen}
      />
    </AdminShell>
  );
}
