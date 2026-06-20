"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, Upload, UtensilsCrossed, X } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants";
import { LanguageLabel } from "@/components/admin/LanguageLabel";
import { useAdminT } from "@/lib/admin-i18n";
import {
  isRequiredTranslationLanguage,
  validateTranslationNames,
} from "@/lib/admin-validation";
import { AdminNumericInput } from "@/components/admin/AdminDigits";
import {
  adminFaDigitClass,
  cn,
  formatPrice,
  getAdminIntlLocale,
  getAdminTranslationName,
} from "@/lib/utils";
import { UploadProgressBar } from "@/components/admin/UploadProgressBar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AdminSheetContent,
} from "@/components/admin/AdminPortal";
import {
  Sheet,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Item = {
  id: string;
  categoryId: string | null;
  mainImage: string | null;
  galleryImages: string;
  basePrice: number;
  preparationMinutes: number | null;
  isActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
  translations: {
    language: string;
    name: string;
    description?: string | null;
    ingredients?: string | null;
  }[];
  category?: { translations: { language: string; name: string }[] };
  discounts?: { type: string; value: number; isActive: boolean }[];
};

type Category = {
  id: string;
  slug: string;
  sortOrder: number;
  translations: { language: string; name: string }[];
};

const UNCATEGORIZED_KEY = "__uncategorized__";

function groupItemsByCategory(items: Item[], categories: Category[]) {
  const grouped = new Map<string, Item[]>();
  for (const item of items) {
    const key = item.categoryId ?? UNCATEGORIZED_KEY;
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  const sections: {
    categoryId: string | null;
    category: Category | null;
    items: Item[];
  }[] = [];

  for (const cat of categories) {
    const catItems = grouped.get(cat.id);
    if (catItems?.length) {
      sections.push({ categoryId: cat.id, category: cat, items: catItems });
      grouped.delete(cat.id);
    }
  }

  const uncategorized = grouped.get(UNCATEGORIZED_KEY);
  if (uncategorized?.length) {
    sections.push({ categoryId: null, category: null, items: uncategorized });
    grouped.delete(UNCATEGORIZED_KEY);
  }

  for (const [key, catItems] of Array.from(grouped.entries())) {
    if (catItems.length) {
      sections.push({ categoryId: key, category: null, items: catItems });
    }
  }

  return sections;
}

function ItemRowContent({
  item,
  locale,
  showCategory,
  onEdit,
  onDelete,
}: {
  item: Item;
  locale: "fa" | "en";
  showCategory: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  const { t: i18n } = useAdminT();
  const primaryLang = locale === "en" ? "en" : "fa";
  const secondaryLang = locale === "en" ? "fa" : "en";
  const primaryName = getAdminTranslationName(
    item.translations,
    primaryLang as "fa" | "en",
    "—"
  );
  const secondaryName = item.translations.find((t) => t.language === secondaryLang)?.name;
  const catName = getAdminTranslationName(item.category?.translations, locale);

  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
            {item.mainImage && (
              <Image src={item.mainImage} alt="" fill className="object-cover" />
            )}
          </div>
          <div>
            <div
              className={cn(
                "text-[13px] font-medium leading-snug",
                primaryLang === "fa" && "font-admin-fa"
              )}
            >
              {primaryName}
            </div>
            {secondaryName && secondaryName !== primaryName && (
              <div
                className={cn(
                  "text-[11px] text-[var(--admin-muted)]",
                  secondaryLang === "fa" && "font-admin-fa"
                )}
              >
                {secondaryName}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      {showCategory && (
        <TableCell className="hidden lg:table-cell">
          <Badge variant="outline">{catName}</Badge>
        </TableCell>
      )}
      <TableCell>
        <span className={adminFaDigitClass(locale, "whitespace-nowrap")}>
          {formatPrice(item.basePrice, getAdminIntlLocale(locale))}{" "}
          {i18n("common.currency")}
        </span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex flex-wrap gap-1">
          <Badge variant={item.isActive ? "success" : "secondary"}>
            {item.isActive ? i18n("common.active") : i18n("common.inactive")}
          </Badge>
          <Badge variant={item.isAvailable ? "success" : "destructive"}>
            {item.isAvailable ? i18n("common.inStock") : i18n("common.out")}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--admin-danger)]"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
}

function SortableItemRow({
  item,
  locale,
  showCategory,
  onEdit,
  onDelete,
}: {
  item: Item;
  locale: "fa" | "en";
  showCategory: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <TableCell className="w-10">
        <button
          type="button"
          className="cursor-grab text-[var(--admin-muted)]"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <ItemRowContent
        item={item}
        locale={locale}
        showCategory={showCategory}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </TableRow>
  );
}

function StaticItemRow({
  item,
  locale,
  showCategory,
  onEdit,
  onDelete,
}: {
  item: Item;
  locale: "fa" | "en";
  showCategory: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <TableRow>
      <ItemRowContent
        item={item}
        locale={locale}
        showCategory={showCategory}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </TableRow>
  );
}

function ItemTable({
  items,
  locale,
  showCategory,
  sortable,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  items: Item[];
  locale: "fa" | "en";
  showCategory: boolean;
  sortable: boolean;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}) {
  const { t: i18n } = useAdminT();
  const sensors = useSensors(useSensor(PointerSensor));

  const header = (
    <TableHeader>
      <TableRow>
        {sortable && <TableHead className="w-10" />}
        <TableHead>{i18n("common.item")}</TableHead>
        {showCategory && (
          <TableHead className="hidden lg:table-cell">{i18n("common.category")}</TableHead>
        )}
        <TableHead>{i18n("common.price")}</TableHead>
        <TableHead className="hidden sm:table-cell">{i18n("common.status")}</TableHead>
        <TableHead>{i18n("common.actions")}</TableHead>
      </TableRow>
    </TableHeader>
  );

  const body = (
    <TableBody>
      {items.map((item) =>
        sortable ? (
          <SortableItemRow
            key={item.id}
            item={item}
            locale={locale}
            showCategory={showCategory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : (
          <StaticItemRow
            key={item.id}
            item={item}
            locale={locale}
            showCategory={showCategory}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      )}
    </TableBody>
  );

  if (!sortable) {
    return (
      <Table>
        {header}
        {body}
      </Table>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd!}>
      <Table>
        {header}
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {body}
        </SortableContext>
      </Table>
    </DndContext>
  );
}

const emptyForm = () => ({
  categoryId: "",
  mainImage: "",
  galleryImages: [] as string[],
  basePrice: 0,
  preparationMinutes: "",
  isActive: true,
  isAvailable: true,
  translations: LANGUAGES.map((l) => ({
    language: l.code,
    name: "",
    description: "",
    ingredients: "",
  })),
});

function isRtlLanguage(code: string) {
  return code === "fa" || code === "ar";
}

export function ItemManager() {
  const { t: i18n, locale } = useAdminT();
  const { upload, getUpload, isUploading, isAnyUploading } = useFileUpload();
  const mainImageUpload = getUpload("main-image");
  const galleryUpload = getUpload("gallery");
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("fa");

  async function load() {
    setLoading(true);
    const catParam = categoryFilter === "all" ? "" : categoryFilter;
    const [itemsRes, catsRes] = await Promise.all([
      fetch(`/api/admin/items?q=${encodeURIComponent(filter)}&categoryId=${catParam}`),
      fetch("/api/admin/categories"),
    ]);
    setItems(await itemsRes.json());
    setCategories(await catsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setActiveTab("fa");
    setSheetOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    setForm({
      categoryId: item.categoryId ?? "",
      mainImage: item.mainImage ?? "",
      galleryImages: JSON.parse(item.galleryImages || "[]"),
      basePrice: item.basePrice,
      preparationMinutes:
        item.preparationMinutes != null ? String(item.preparationMinutes) : "",
      isActive: item.isActive,
      isAvailable: item.isAvailable,
      translations: LANGUAGES.map((l) => {
        const tr = item.translations.find((t) => t.language === l.code);
        return {
          language: l.code,
          name: tr?.name ?? "",
          description: tr?.description ?? "",
          ingredients: tr?.ingredients ?? "",
        };
      }),
    });
    setErrors({});
    setActiveTab("fa");
    setSheetOpen(true);
  }

  async function save() {
    const nextErrors: Record<string, string> = {};
    const missing = validateTranslationNames(form.translations);
    for (const code of missing) {
      nextErrors[code] = i18n(
        code === "fa" ? "common.faNameRequired" : "common.enNameRequired"
      );
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setActiveTab(missing[0]);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        ...form,
        galleryImages: form.galleryImages,
        preparationMinutes: form.preparationMinutes
          ? Number(form.preparationMinutes)
          : null,
      };
      const res = editing
        ? await fetch(`/api/admin/items/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error();
      toast.success(editing ? i18n("items.updated") : i18n("items.created"));
      setSheetOpen(false);
      load();
    } catch {
      toast.error(i18n("items.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  const canReorder = !filter.trim();
  const showCategoryColumn = categoryFilter === "all";
  const itemSections = useMemo(() => {
    if (categoryFilter === "all") {
      return groupItemsByCategory(items, categories);
    }
    return [
      {
        categoryId: categoryFilter,
        category: categories.find((c) => c.id === categoryFilter) ?? null,
        items,
      },
    ];
  }, [items, categories, categoryFilter]);

  function handleDragEnd(categoryId: string | null) {
    return async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const categoryItems = items.filter(
        (item) => (item.categoryId ?? null) === categoryId
      );
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(categoryItems, oldIndex, newIndex);
      const reorderedIds = new Set(reordered.map((item) => item.id));
      const otherItems = items.filter((item) => !reorderedIds.has(item.id));
      setItems([...otherItems, ...reordered]);

      await fetch("/api/admin/items/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          orderedIds: reordered.map((item) => item.id),
        }),
      });
      toast.success(i18n("items.orderUpdated"));
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            placeholder={i18n("items.searchPlaceholder")}
            className="w-full sm:w-[240px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={i18n("items.allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n("items.allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {getAdminTranslationName(c.translations, locale, c.slug)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {i18n("items.add")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <UtensilsCrossed className="mb-3 h-10 w-10 text-[var(--admin-muted)]" />
          <p className="mb-4 text-[var(--admin-muted)]">{i18n("items.empty")}</p>
          <Button onClick={openCreate}>{i18n("items.add")}</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {canReorder && (
            <p className="text-sm text-[var(--admin-muted)]">{i18n("items.reorderHint")}</p>
          )}
          {itemSections.map((section) => {
            const sectionTitle = section.category
              ? getAdminTranslationName(section.category.translations, locale, section.category.slug)
              : i18n("items.uncategorized");

            return (
              <div key={section.categoryId ?? UNCATEGORIZED_KEY} className="space-y-2">
                {categoryFilter === "all" && (
                  <h3 className="text-sm font-semibold text-[var(--admin-foreground)]">
                    {sectionTitle}
                  </h3>
                )}
                <div className="rounded-lg border bg-[var(--admin-surface)]">
                  <ItemTable
                    items={section.items}
                    locale={locale}
                    showCategory={showCategoryColumn}
                    sortable={canReorder}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                    onDragEnd={handleDragEnd(section.categoryId)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <AdminSheetContent className="w-full overflow-y-auto sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>{editing ? i18n("items.edit") : i18n("items.add")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("items.images")}</h3>
              <label
                className={cn(
                  "flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-gray-50",
                  isUploading("main-image") && "pointer-events-none opacity-60"
                )}
              >
                {form.mainImage ? (
                  <div className="relative h-full w-full">
                    <Image src={form.mainImage} alt="" fill className="rounded-lg object-cover" />
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-[var(--admin-muted)]" />
                    <span className="text-sm text-[var(--admin-muted)]">
                      {i18n("items.uploadMain")}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading("main-image")}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    try {
                      const url = await upload("main-image", file);
                      setForm({ ...form, mainImage: url });
                    } catch {
                      toast.error(i18n("items.saveFailed"));
                    }
                  }}
                />
              </label>
              <UploadProgressBar
                progress={mainImageUpload?.progress ?? null}
                fileName={mainImageUpload?.fileName}
              />
              <div className="flex flex-wrap gap-2">
                {form.galleryImages.map((url, gi) => (
                  <div key={`${url}-${gi}`} className="relative h-16 w-16">
                    <Image src={url} alt="" fill className="rounded-lg object-cover" />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 rounded-full bg-[var(--admin-danger)] p-0.5 text-white"
                      onClick={() =>
                        setForm({
                          ...form,
                          galleryImages: form.galleryImages.filter((_, j) => j !== gi),
                        })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label
                  className={cn(
                    "flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed",
                    isUploading("gallery") && "pointer-events-none opacity-60"
                  )}
                >
                  <Plus className="h-4 w-4 text-[var(--admin-muted)]" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={isUploading("gallery")}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      e.target.value = "";
                      const urls: string[] = [];
                      try {
                        for (const file of files) {
                          urls.push(await upload("gallery", file));
                        }
                        setForm({
                          ...form,
                          galleryImages: [...form.galleryImages, ...urls],
                        });
                      } catch {
                        toast.error(i18n("items.saveFailed"));
                      }
                    }}
                  />
                </label>
              </div>
              <UploadProgressBar
                progress={galleryUpload?.progress ?? null}
                fileName={galleryUpload?.fileName}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("items.basicInfo")}</h3>
              <div className="space-y-2">
                <Label>{i18n("common.category")}</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={i18n("items.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {getAdminTranslationName(c.translations, locale, c.slug)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{i18n("items.basePrice")}</Label>
                <div className="relative">
                  <AdminNumericInput
                    value={String(form.basePrice)}
                    onChange={(value) =>
                      setForm({ ...form, basePrice: Number(value) || 0 })
                    }
                    className={cn(locale === "fa" ? "pl-12" : "pr-12")}
                  />
                  <span
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-sm text-[var(--admin-muted)]",
                      locale === "fa" ? "left-3" : "right-3"
                    )}
                  >
                    {i18n("common.currency")}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{i18n("items.preparationTime")}</Label>
                <div className="relative">
                  <AdminNumericInput
                    value={form.preparationMinutes}
                    onChange={(value) =>
                      setForm({ ...form, preparationMinutes: value })
                    }
                    className={cn(locale === "fa" ? "pl-12" : "pr-12")}
                  />
                  <span
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-sm text-[var(--admin-muted)]",
                      locale === "fa" ? "left-3" : "right-3"
                    )}
                  >
                    {i18n("items.preparationMinutesSuffix")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>{i18n("common.active")}</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>{i18n("common.inStock")}</Label>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("items.content")}</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 bg-transparent p-0 sm:grid-cols-3">
                  {LANGUAGES.map((l) => (
                    <TabsTrigger
                      key={l.code}
                      value={l.code}
                      className={cn(
                        "h-auto w-full justify-start rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-2 shadow-none",
                        "data-[state=active]:border-[var(--admin-accent)] data-[state=active]:bg-[var(--admin-accent)]/5 data-[state=active]:shadow-none",
                        errors[l.code] &&
                          "border-red-300 data-[state=active]:border-red-400"
                      )}
                    >
                      <LanguageLabel code={l.code} variant="compact" className="truncate" />
                    </TabsTrigger>
                  ))}
                </TabsList>
                {form.translations.map((trans, i) => (
                  <TabsContent
                    key={trans.language}
                    value={trans.language}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>
                        {i18n("common.name")}
                        {isRequiredTranslationLanguage(trans.language) && (
                          <span className="text-red-500"> *</span>
                        )}
                      </Label>
                      <Input
                        dir={isRtlLanguage(trans.language) ? "rtl" : "ltr"}
                        className={cn(
                          "text-start",
                          isRtlLanguage(trans.language) && "font-admin-fa"
                        )}
                        value={trans.name}
                        onChange={(e) => {
                          const translations = [...form.translations];
                          translations[i] = { ...trans, name: e.target.value };
                          setForm({ ...form, translations });
                        }}
                      />
                      {errors[trans.language] && (
                        <p className="text-xs text-red-500">{errors[trans.language]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{i18n("items.ingredients")}</Label>
                      <Textarea
                        dir={isRtlLanguage(trans.language) ? "rtl" : "ltr"}
                        className={cn(
                          "text-start",
                          isRtlLanguage(trans.language) && "font-admin-fa"
                        )}
                        rows={3}
                        value={trans.ingredients ?? ""}
                        onChange={(e) => {
                          const translations = [...form.translations];
                          translations[i] = { ...trans, ingredients: e.target.value };
                          setForm({ ...form, translations });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{i18n("items.description")}</Label>
                      <Textarea
                        dir={isRtlLanguage(trans.language) ? "rtl" : "ltr"}
                        className={cn(
                          "text-start",
                          isRtlLanguage(trans.language) && "font-admin-fa"
                        )}
                        rows={4}
                        value={trans.description ?? ""}
                        onChange={(e) => {
                          const translations = [...form.translations];
                          translations[i] = { ...trans, description: e.target.value };
                          setForm({ ...form, translations });
                        }}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              {i18n("common.cancel")}
            </Button>
            <Button onClick={save} disabled={saving || isAnyUploading}>
              {saving ? i18n("common.saving") : i18n("common.save")}
            </Button>
          </SheetFooter>
        </AdminSheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AdminAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n("items.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("items.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--admin-danger)] hover:bg-red-700"
              onClick={async () => {
                if (!deleteId) return;
                await fetch(`/api/admin/items/${deleteId}`, { method: "DELETE" });
                setDeleteId(null);
                toast.success(i18n("items.deleted"));
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
