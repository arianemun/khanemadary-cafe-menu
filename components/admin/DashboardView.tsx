"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, PackageX, Percent, Tag, UtensilsCrossed } from "lucide-react";
import { useAdminT } from "@/lib/admin-i18n";
import { AdminDigits } from "@/components/admin/AdminDigits";
import { cn, adminFaDigitClass, formatPrice, getAdminIntlLocale } from "@/lib/utils";
import { CafeStatusCard } from "@/components/admin/CafeStatusCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RecentItem = {
  id: string;
  mainImage: string | null;
  basePrice: number;
  isActive: boolean;
  isAvailable: boolean;
  translations: { language: string; name: string }[];
};

interface DashboardViewProps {
  itemCount: number;
  categoryCount: number;
  discountCount: number;
  outOfStockCount: number;
  recentItems: RecentItem[];
  forceClosed: boolean;
  scheduleOpen: boolean;
}

export function DashboardView({
  itemCount,
  categoryCount,
  discountCount,
  outOfStockCount,
  recentItems,
  forceClosed,
  scheduleOpen,
}: DashboardViewProps) {
  const { t, locale } = useAdminT();

  const KPI = [
    { key: "items" as const, label: t("dashboard.totalItems"), icon: UtensilsCrossed, color: "bg-blue-50 text-blue-600" },
    { key: "categories" as const, label: t("dashboard.activeCategories"), icon: Tag, color: "bg-green-50 text-green-600" },
    { key: "discounts" as const, label: t("dashboard.activeDiscounts"), icon: Percent, color: "bg-orange-50 text-orange-600" },
    { key: "stock" as const, label: t("dashboard.outOfStock"), icon: PackageX, color: "bg-red-50 text-red-600" },
  ];

  const values = {
    items: itemCount,
    categories: categoryCount,
    discounts: discountCount,
    stock: outOfStockCount,
  };

  const quickActions = [
    {
      href: "/admin/menu/items",
      label: t("dashboard.addItem"),
      icon: UtensilsCrossed,
      iconBg: "bg-blue-50 text-blue-600",
      ring: "hover:ring-blue-200",
    },
    {
      href: "/admin/menu/categories",
      label: t("dashboard.addCategory"),
      icon: Tag,
      iconBg: "bg-green-50 text-green-600",
      ring: "hover:ring-green-200",
    },
    {
      href: "/admin/menu/discounts",
      label: t("dashboard.addDiscount"),
      icon: Percent,
      iconBg: "bg-orange-50 text-orange-600",
      ring: "hover:ring-orange-200",
    },
    {
      href: "/fa",
      label: t("common.viewSite"),
      icon: ExternalLink,
      iconBg: "bg-indigo-50 text-indigo-600",
      ring: "hover:ring-indigo-200",
      external: true,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <CafeStatusCard forceClosed={forceClosed} scheduleOpen={scheduleOpen} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key}>
              <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${kpi.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <AdminDigits className="text-2xl font-bold leading-none">
                    {values[kpi.key]}
                  </AdminDigits>
                  <div className="mt-1 text-[13px] text-[var(--admin-muted)]">{kpi.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.recentItems")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.item")}</TableHead>
                  <TableHead>{t("common.price")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentItems.map((item) => {
                  const name = item.translations.find((tr) => tr.language === "fa")?.name ?? "—";
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                            {item.mainImage && (
                              <Image src={item.mainImage} alt="" fill className="object-cover" />
                            )}
                          </div>
                          <span className="font-medium">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={adminFaDigitClass(locale)}>
                          {formatPrice(item.basePrice, getAdminIntlLocale(locale))}{" "}
                          {t("common.currency")}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={item.isActive ? "success" : "secondary"}>
                            {item.isActive ? t("common.active") : t("common.inactive")}
                          </Badge>
                          <Badge variant={item.isAvailable ? "success" : "destructive"}>
                            {item.isAvailable ? t("common.inStock") : t("common.out")}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    target={"external" in action && action.external ? "_blank" : undefined}
                    rel={"external" in action && action.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 text-center transition-all",
                      "hover:-translate-y-0.5 hover:shadow-md hover:ring-2",
                      action.ring
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                        action.iconBg
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <span className="text-sm font-medium leading-snug text-[var(--admin-text)]">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
