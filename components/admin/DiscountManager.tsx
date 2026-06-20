"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Percent, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminT } from "@/lib/admin-i18n";
import { AdminNumericInput } from "@/components/admin/AdminDigits";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import {
  adminFaDigitClass,
  cn,
  formatAdminDate,
  formatAdminDisplayValue,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminAlertDialogContent,
  AdminDialogContent,
} from "@/components/admin/AdminPortal";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const WEEKDAY_KEYS = [
  { value: 6, key: "sat" },
  { value: 0, key: "sun" },
  { value: 1, key: "mon" },
  { value: 2, key: "tue" },
  { value: 3, key: "wed" },
  { value: 4, key: "thu" },
  { value: 5, key: "fri" },
] as const;

type Discount = {
  id: string;
  itemId: string;
  type: string;
  value: number;
  startDate: string | null;
  endDate: string | null;
  weekdays: string;
  isActive: boolean;
  item?: {
    mainImage?: string | null;
    translations: { language: string; name: string }[];
  };
};

type MenuItem = {
  id: string;
  mainImage?: string | null;
  translations: { language: string; name: string }[];
};

function scheduleLabel(
  d: Discount,
  i18n: (key: string) => string,
  locale: "fa" | "en"
) {
  let weekdays: number[] = [];
  try {
    weekdays = JSON.parse(d.weekdays || "[]");
  } catch {
    weekdays = [];
  }
  if (d.startDate && d.endDate) {
    const start = formatAdminDate(d.startDate, locale);
    const end = formatAdminDate(d.endDate, locale);
    return `${start} ${i18n("common.to")} ${end}`;
  }
  if (weekdays.length) {
    return (
      <div className="flex gap-1">
        {WEEKDAY_KEYS.map((day) => (
          <span
            key={day.value}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              weekdays.includes(day.value)
                ? "bg-[var(--admin-accent)] text-white"
                : "bg-gray-100 text-[var(--admin-muted)]"
            }`}
          >
            {i18n(`discounts.weekdays.${day.key}.short`)}
          </span>
        ))}
      </div>
    );
  }
  return i18n("common.alwaysActive");
}

const emptyForm = () => ({
  itemId: "",
  type: "percentage" as "percentage" | "fixed",
  value: 0,
  scheduleType: "always" as "always" | "range" | "weekdays",
  startDate: "",
  endDate: "",
  weekdays: [] as number[],
  isActive: true,
});

export function DiscountManager() {
  const { t: i18n, locale } = useAdminT();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [itemSearch, setItemSearch] = useState("");
  const [form, setForm] = useState(emptyForm());

  async function load() {
    setLoading(true);
    const [dRes, iRes] = await Promise.all([
      fetch("/api/admin/discounts"),
      fetch("/api/admin/items"),
    ]);
    setDiscounts(await dRes.json());
    setItems(await iRes.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!form.itemId) {
      toast.error(i18n("discounts.selectItem"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: form.itemId,
          type: form.type,
          value: form.value,
          startDate: form.scheduleType === "range" ? form.startDate : null,
          endDate: form.scheduleType === "range" ? form.endDate : null,
          weekdays: form.scheduleType === "weekdays" ? form.weekdays : [],
          isActive: form.isActive,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(i18n("discounts.created"));
      setDialogOpen(false);
      setForm(emptyForm());
      load();
    } catch {
      toast.error(i18n("discounts.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const name = item.translations.find((t) => t.language === "fa")?.name ?? "";
    return name.toLowerCase().includes(itemSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(emptyForm()); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          {i18n("discounts.add")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Percent className="mb-3 h-10 w-10 text-[var(--admin-muted)]" />
          <p className="mb-4 text-[var(--admin-muted)]">{i18n("discounts.empty")}</p>
          <Button onClick={() => setDialogOpen(true)}>{i18n("discounts.add")}</Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-[var(--admin-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{i18n("common.item")}</TableHead>
                <TableHead className="hidden md:table-cell">{i18n("common.type")}</TableHead>
                <TableHead>{i18n("common.value")}</TableHead>
                <TableHead className="hidden lg:table-cell">{i18n("common.schedule")}</TableHead>
                <TableHead className="hidden sm:table-cell">{i18n("common.status")}</TableHead>
                <TableHead>{i18n("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((d) => {
                const name =
                  d.item?.translations.find((t) => t.language === "fa")?.name ?? "—";
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                          {d.item?.mainImage && (
                            <Image src={d.item.mainImage} alt="" fill className="object-cover" />
                          )}
                        </div>
                        <span className="font-medium">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">
                        {d.type === "percentage" ? "%" : i18n("common.currency")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.type === "percentage" ? (
                        <span className={adminFaDigitClass(locale)}>
                          {formatAdminDisplayValue(d.value, locale)}%
                        </span>
                      ) : (
                        <span className={adminFaDigitClass(locale)}>
                          {formatAdminDisplayValue(d.value, locale)}{" "}
                          {i18n("common.currency")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={cn("hidden lg:table-cell", adminFaDigitClass(locale))}>
                      {scheduleLabel(d, i18n, locale)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={d.isActive ? "success" : "secondary"}>
                        {d.isActive ? i18n("common.active") : i18n("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Switch
                          checked={d.isActive}
                          onCheckedChange={async () => {
                            await fetch(`/api/admin/discounts/${d.id}/toggle`, {
                              method: "PATCH",
                            });
                            load();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[var(--admin-danger)]"
                          onClick={() => setDeleteId(d.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent className="w-[calc(100vw-2rem)] max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{i18n("discounts.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{i18n("common.type")}</Label>
              <RadioGroup
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as "percentage" | "fixed" })
                }
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="percentage" id="pct" />
                  <Label htmlFor="pct">{i18n("discounts.typePercent")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">{i18n("discounts.typeFixed")}</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>{i18n("common.value")}</Label>
              <div className="relative">
                <AdminNumericInput
                  value={String(form.value)}
                  onChange={(value) => {
                    const nextValue = Number(value) || 0;
                    setForm({
                      ...form,
                      value: nextValue,
                      ...(nextValue <= 0 ? { itemId: "" } : {}),
                    });
                  }}
                  className={locale === "fa" ? "pl-10" : "pr-10"}
                />
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-sm text-[var(--admin-muted)]",
                    locale === "fa" ? "left-3" : "right-3"
                  )}
                >
                  {form.type === "percentage" ? "%" : i18n("common.currency")}
                </span>
              </div>
            </div>
            {form.value > 0 && (
              <div className="space-y-2">
                <Label>{i18n("common.item")}</Label>
                <Input
                  placeholder={i18n("discounts.searchItems")}
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
                <div className="max-h-32 overflow-y-auto rounded-md border">
                  {filteredItems.slice(0, 8).map((item) => {
                    const name =
                      item.translations.find((t) => t.language === "fa")?.name ?? "";
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`block w-full px-3 py-2 text-start text-sm hover:bg-gray-50 ${
                          form.itemId === item.id ? "bg-blue-50 font-medium" : ""
                        }`}
                        onClick={() => setForm({ ...form, itemId: item.id })}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>{i18n("common.schedule")}</Label>
              <RadioGroup
                value={form.scheduleType}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    scheduleType: v as "always" | "range" | "weekdays",
                  })
                }
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="always" id="always" />
                  <Label htmlFor="always">{i18n("discounts.scheduleAlways")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range">{i18n("discounts.scheduleRange")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="weekdays" id="weekdays" />
                  <Label htmlFor="weekdays">{i18n("discounts.scheduleWeekdays")}</Label>
                </div>
              </RadioGroup>
              {form.scheduleType === "range" && (
                <div className="flex gap-2">
                  <AdminDatePicker
                    value={form.startDate}
                    onChange={(startDate) =>
                      setForm({ ...form, startDate })
                    }
                  />
                  <AdminDatePicker
                    value={form.endDate}
                    onChange={(endDate) =>
                      setForm({ ...form, endDate })
                    }
                  />
                </div>
              )}
              {form.scheduleType === "weekdays" && (
                <div className="grid grid-cols-4 gap-2">
                  {WEEKDAY_KEYS.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      size="sm"
                      variant={
                        form.weekdays.includes(day.value) ? "default" : "outline"
                      }
                      className={cn(
                        "h-9 min-h-9 w-full px-2 text-sm whitespace-normal text-center leading-tight",
                        locale === "fa" && "font-admin-fa"
                      )}
                      onClick={() => {
                        const weekdays = form.weekdays.includes(day.value)
                          ? form.weekdays.filter((d) => d !== day.value)
                          : [...form.weekdays, day.value];
                        setForm({ ...form, weekdays });
                      }}
                    >
                      {i18n(`discounts.weekdays.${day.key}.label`)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label>{i18n("common.active")}</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? i18n("common.saving") : i18n("common.save")}
            </Button>
          </DialogFooter>
        </AdminDialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AdminAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n("discounts.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("discounts.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--admin-danger)] hover:bg-red-700"
              onClick={async () => {
                if (!deleteId) return;
                await fetch(`/api/admin/discounts/${deleteId}`, { method: "DELETE" });
                setDeleteId(null);
                toast.success(i18n("discounts.deleted"));
                load();
              }}
            >
              {i18n("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AdminAlertDialogContent>
      </AlertDialog>
    </div>
  );
}
