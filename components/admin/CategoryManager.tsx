"use client";

import { useEffect, useState } from "react";
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
import { GripVertical, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LANGUAGES } from "@/lib/constants";
import { slugify } from "@/lib/admin-constants";
import { validateTranslationNames } from "@/lib/admin-validation";
import { LanguageLabel } from "@/components/admin/LanguageLabel";
import { useAdminT } from "@/lib/admin-i18n";
import { AdminDigits } from "@/components/admin/AdminDigits";
import {
  DEFAULT_CATEGORY_ITEM_DISPLAY_MODE,
  type CategoryItemDisplayMode,
} from "@/lib/category-item-display";
import { cn } from "@/lib/utils";
import { CategoryIconPreview } from "@/components/admin/CategoryIconPreview";
import { UploadProgressBar } from "@/components/admin/UploadProgressBar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Category = {
  id: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  itemDisplayMode: CategoryItemDisplayMode;
  itemDisplayOddBackground: boolean;
  translations: { language: string; name: string }[];
  _count?: { items: number };
};

const DISPLAY_MODE_OPTIONS: CategoryItemDisplayMode[] = [
  "center",
  "line",
  "mixed",
  "line-zigzag",
];

const emptyForm = () => ({
  slug: "",
  icon: "",
  isActive: true,
  itemDisplayMode: DEFAULT_CATEGORY_ITEM_DISPLAY_MODE as CategoryItemDisplayMode,
  itemDisplayOddBackground: true,
  translations: LANGUAGES.map((l) => ({ language: l.code, name: "" })),
});

function SortableCategoryRow({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t: i18n } = useAdminT();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });
  const faName =
    category.translations.find((t) => t.language === "fa")?.name ?? category.slug;

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
      <TableCell className="hidden sm:table-cell">
        <CategoryIconPreview icon={category.icon} size={32} />
      </TableCell>
      <TableCell>
        <div className="font-semibold">{faName}</div>
        <div className="hidden text-xs text-[var(--admin-muted)] sm:block">{category.slug}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline">
          <AdminDigits>{category._count?.items ?? 0}</AdminDigits>{" "}
          {i18n("common.items")}
        </Badge>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={category.isActive ? "success" : "secondary"}>
          {category.isActive ? i18n("common.active") : i18n("common.inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Switch
            checked={category.isActive}
            onCheckedChange={() => onToggle(category.id)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--admin-danger)] hover:text-red-700"
            onClick={() => onDelete(category.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CategoryManager() {
  const { t: i18n } = useAdminT();
  const { upload, getUpload, isUploading, isAnyUploading } = useFileUpload();
  const iconUpload = getUpload("icon");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(useSensor(PointerSensor));

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setSheetOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({
      slug: cat.slug,
      icon: cat.icon ?? "",
      isActive: cat.isActive,
      itemDisplayMode: cat.itemDisplayMode ?? DEFAULT_CATEGORY_ITEM_DISPLAY_MODE,
      itemDisplayOddBackground: cat.itemDisplayOddBackground ?? true,
      translations: LANGUAGES.map((l) => ({
        language: l.code,
        name: cat.translations.find((t) => t.language === l.code)?.name ?? "",
      })),
    });
    setErrors({});
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
    if (!form.slug.trim()) nextErrors.slug = i18n("categories.slugRequired");
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/categories/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editing ? i18n("categories.updated") : i18n("categories.created"));
      setSheetOpen(false);
      setEditing(null);
      setForm(emptyForm());
      load();
    } catch {
      toast.error(i18n("categories.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);
    await fetch("/api/admin/categories/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((c) => c.id) }),
    });
    toast.success(i18n("categories.orderUpdated"));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {i18n("categories.add")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] py-16">
          <Tag className="mb-3 h-10 w-10 text-[var(--admin-muted)]" />
          <p className="mb-4 text-[var(--admin-muted)]">{i18n("categories.empty")}</p>
          <Button onClick={openCreate}>{i18n("categories.add")}</Button>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="hidden sm:table-cell">{i18n("common.icon")}</TableHead>
                  <TableHead>{i18n("common.name")}</TableHead>
                  <TableHead className="hidden md:table-cell">{i18n("common.items")}</TableHead>
                  <TableHead className="hidden sm:table-cell">{i18n("common.status")}</TableHead>
                  <TableHead>{i18n("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {categories.map((cat) => (
                    <SortableCategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={openEdit}
                      onToggle={async (id) => {
                        await fetch(`/api/admin/categories/${id}/toggle`, {
                          method: "PATCH",
                        });
                        load();
                      }}
                      onDelete={setDeleteId}
                    />
                  ))}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <AdminSheetContent className="w-full overflow-y-auto sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{editing ? i18n("categories.edit") : i18n("categories.add")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("categories.basicInfo")}</h3>
              <div className="space-y-2">
                <Label>{i18n("common.slug")}</Label>
                <Input
                  readOnly
                  value={form.slug}
                  className="cursor-not-allowed bg-gray-50 text-[var(--admin-muted)]"
                />
                <p className="text-xs text-[var(--admin-muted)]">
                  {i18n("categories.slugAutoHint")}
                </p>
                {errors.slug && (
                  <p className="text-xs text-red-500">{errors.slug}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{i18n("common.icon")}</Label>
                <label
                  className={cn(
                    "flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--admin-border)] bg-gray-50",
                    isUploading("icon") && "pointer-events-none opacity-60"
                  )}
                >
                  <CategoryIconPreview icon={form.icon} size={96} className="rounded-lg" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading("icon")}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = "";
                      try {
                        const url = await upload("icon", file);
                        setForm({ ...form, icon: url });
                      } catch {
                        toast.error(i18n("categories.iconUploadFailed"));
                      }
                    }}
                  />
                </label>
                <UploadProgressBar
                  progress={iconUpload?.progress ?? null}
                  fileName={iconUpload?.fileName}
                />
                <p className="text-xs text-[var(--admin-muted)]">{i18n("categories.iconUploadHint")}</p>
              </div>
              <div className="flex items-center justify-between">
                <Label>{i18n("common.active")}</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("categories.displaySettings")}</h3>
              <div className="space-y-2">
                <Label>{i18n("categories.itemDisplayMode")}</Label>
                <Select
                  value={form.itemDisplayMode}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      itemDisplayMode: value as CategoryItemDisplayMode,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISPLAY_MODE_OPTIONS.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {i18n(`categories.displayMode.${mode}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[var(--admin-muted)]">
                  {i18n(`categories.displayModeDesc.${form.itemDisplayMode}`)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] px-4 py-3">
                <div>
                  <Label>{i18n("categories.itemDisplayOddBackground")}</Label>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {i18n("categories.itemDisplayOddBackgroundDesc")}
                  </p>
                </div>
                <Switch
                  checked={form.itemDisplayOddBackground}
                  onCheckedChange={(v) =>
                    setForm({ ...form, itemDisplayOddBackground: v })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{i18n("categories.namesByLanguage")}</h3>
              {form.translations.map((trans, i) => {
                const lang = LANGUAGES.find((l) => l.code === trans.language);
                return (
                  <div key={trans.language} className="space-y-2">
                    <LanguageLabel code={trans.language} label={lang?.label} variant="badge" />
                    <Input
                      className={trans.language === "fa" ? "font-admin-fa" : ""}
                      value={trans.name}
                      onChange={(e) => {
                        const translations = [...form.translations];
                        translations[i] = { ...trans, name: e.target.value };
                        const nextSlug =
                          trans.language === "en"
                            ? slugify(e.target.value)
                            : form.slug;
                        setForm({
                          ...form,
                          translations,
                          slug: nextSlug,
                        });
                      }}
                    />
                    {(trans.language === "fa" || trans.language === "en") &&
                      errors[trans.language] && (
                      <p className="text-xs text-red-500">{errors[trans.language]}</p>
                    )}
                  </div>
                );
              })}
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
            <AlertDialogTitle>{i18n("categories.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("categories.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--admin-danger)] hover:bg-red-700"
              onClick={async () => {
                if (!deleteId) return;
                await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
                setDeleteId(null);
                toast.success(i18n("categories.deleted"));
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
