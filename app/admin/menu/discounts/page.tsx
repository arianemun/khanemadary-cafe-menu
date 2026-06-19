import { AdminShell } from "@/components/admin/AdminShell";
import { DiscountManager } from "@/components/admin/DiscountManager";

export default function AdminDiscountsPage() {
  return (
    <AdminShell>
      <DiscountManager />
    </AdminShell>
  );
}
