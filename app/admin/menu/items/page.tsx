import { AdminShell } from "@/components/admin/AdminShell";
import { ItemManager } from "@/components/admin/ItemManager";

export default function AdminItemsPage() {
  return (
    <AdminShell>
      <ItemManager />
    </AdminShell>
  );
}
