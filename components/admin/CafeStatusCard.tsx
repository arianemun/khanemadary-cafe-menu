"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { useAdminT } from "@/lib/admin-i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CafeStatusCardProps {
  forceClosed: boolean;
  scheduleOpen: boolean;
}

export function CafeStatusCard({ forceClosed, scheduleOpen }: CafeStatusCardProps) {
  const { t } = useAdminT();
  const [closed, setClosed] = useState(forceClosed);
  const [saving, setSaving] = useState(false);

  const displayOpen = closed ? false : scheduleOpen;

  async function toggleForceClosed(value: boolean) {
    setSaving(true);
    try {
      const settingsRes = await fetch("/api/admin/settings");
      const settings = await settingsRes.json();
      const general = (settings.general ?? {}) as Record<string, unknown>;

      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general: { ...general, forceClosed: value } }),
      });

      setClosed(value);
      toast.success(t("settings.saved"));
    } catch {
      toast.error(t("settings.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Store className="h-5 w-5" />
          </div>
          <CardTitle>{t("dashboard.cafeStatus")}</CardTitle>
        </div>
        <Badge variant={displayOpen ? "success" : "destructive"}>
          {displayOpen ? t("dashboard.showingOpen") : t("dashboard.showingClosed")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-[var(--admin-muted)]">{t("dashboard.forceClosedDesc")}</p>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] px-4 py-3">
          <Label htmlFor="force-closed" className="font-admin-fa cursor-pointer">
            {t("dashboard.forceClosed")}
          </Label>
          <Switch
            id="force-closed"
            checked={closed}
            disabled={saving}
            onCheckedChange={toggleForceClosed}
          />
        </div>
      </CardContent>
    </Card>
  );
}
