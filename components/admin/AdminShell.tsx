import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import {
  normalizeCafeNameTranslations,
  pickBrandTranslation,
} from "@/lib/brand-translations";
import { AdminLayout } from "./AdminLayout";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const [session, general] = await Promise.all([
    getServerSession(authOptions),
    getSettings("general"),
  ]);
  const user = session?.user as { role?: string; email?: string; name?: string };
  const settings = (general ?? {}) as Record<string, unknown>;
  const cafeNameTranslations = normalizeCafeNameTranslations(settings);

  return (
    <AdminLayout
      role={user?.role}
      userEmail={user?.email}
      userName={user?.name}
      cafeName={pickBrandTranslation(cafeNameTranslations, "fa")}
      cafeNameEn={pickBrandTranslation(cafeNameTranslations, "en")}
      logo={(settings.logo as string) ?? ""}
    >
      {children}
    </AdminLayout>
  );
}
