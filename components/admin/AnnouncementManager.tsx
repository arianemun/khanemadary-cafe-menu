"use client";

import { useCallback, useEffect, useState } from "react";
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
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LanguageLabel } from "@/components/admin/LanguageLabel";
import { AdminDigits, AdminNumericInput } from "@/components/admin/AdminDigits";
import { useAdminT } from "@/lib/admin-i18n";
import { LANGUAGES } from "@/lib/constants";
import { getAnnouncementAdminPreviewText } from "@/lib/announcement-translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type AnnouncementTranslation = {
  language: string;
  title: string;
  message: string;
};

type AnnouncementRow = {
  id: string;
  link: string | null;
  durationSeconds: number;
  maxDisplayCount: number;
  isActive: boolean;
  sortOrder: number;
  translations: AnnouncementTranslation[];
};

const emptyForm = () => ({
  translations: LANGUAGES.map((lang) => ({
    language: lang.code,
    title: "",
    message: "",
  })),
  link: "",
  durationSeconds: "10",
  maxDisplayCount: "1",
  isActive: true,
});

function isRtlLanguage(code: string) {
  return code === "fa" || code === "ar";
}

function SortableAnnouncementRow({
  row,
  locale,
  onEdit,
  onDelete,
}: {
  row: AnnouncementRow;
  locale: "fa" | "en";
  onEdit: (row: AnnouncementRow) => void;
  onDelete: (id: string) => void;
}) {
  const { t: i18n } = useAdminT();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });

  const { title, message } = getAnnouncementAdminPreviewText(
    row.translations,
    locale
  );

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <button
          type="button"
          className="cursor-grab text-[var(--admin-muted)]"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          {title ? <div className="truncate font-semibold">{title}</div> : null}
          <div className="truncate text-xs text-[var(--admin-muted)]">
            {message || "—"}
          </div>
          <div className="mt-1 text-xs text-[var(--admin-muted)]">
            {i18n("settings.announcementDuration")}:{" "}
            <AdminDigits>{row.durationSeconds}</AdminDigits>{" "}
            {i18n("settings.announcementSeconds")}
            {" · "}
            {i18n("settings.announcementMaxViews")}:{" "}
            {row.maxDisplayCount <= 0 ? (
              i18n("settings.announcementUnlimited")
            ) : (
              <AdminDigits>{row.maxDisplayCount}</AdminDigits>
            )}
          </div>
        </div>
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? i18n("common.active") : i18n("common.inactive")}
        </Badge>
        <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--admin-danger)]"
          onClick={() => onDelete(row.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function AnnouncementManager() {
  const { t: i18n, locale } = useAdminT();
  const sensors = useSensors(useSensor(PointerSensor));
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<string>(LANGUAGES[0].code);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/announcements");
    if (res.ok) setAnnouncements(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setActiveTab(LANGUAGES[0].code);
    setDialogOpen(true);
  }

  function openEdit(row: AnnouncementRow) {
    setEditingId(row.id);
    setForm({
      translations: LANGUAGES.map((lang) => {
        const translation = row.translations.find(
          (item) => item.language === lang.code
        );
        return {
          language: lang.code,
          title: translation?.title ?? "",
          message: translation?.message ?? "",
        };
      }),
      link: row.link ?? "",
      durationSeconds: String(row.durationSeconds),
      maxDisplayCount: String(row.maxDisplayCount),
      isActive: row.isActive,
    });
    setActiveTab(LANGUAGES[0].code);
    setDialogOpen(true);
  }

  async function saveAnnouncement() {
    const payload = {
      translations: form.translations.map((row) => ({
        language: row.language,
        title: row.title || null,
        message: row.message || null,
      })),
      link: form.link || null,
      durationSeconds: Number(form.durationSeconds) || 0,
      maxDisplayCount: Number(form.maxDisplayCount) || 0,
      isActive: form.isActive,
    };

    const res = await fetch(
      editingId
        ? `/api/admin/announcements/${editingId}`
        : "/api/admin/announcements",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      toast.error(i18n("settings.announcementSaveFailed"));
      return;
    }

    toast.success(
      i18n(
        editingId
          ? "settings.announcementUpdated"
          : "settings.announcementCreated"
      )
    );
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    void load();
  }

  async function deleteAnnouncement() {
    if (!deleteId) return;
    await fetch(`/api/admin/announcements/${deleteId}`, { method: "DELETE" });
    toast.success(i18n("settings.announcementDeleted"));
    setDeleteId(null);
    void load();
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = announcements.findIndex((row) => row.id === active.id);
    const newIndex = announcements.findIndex((row) => row.id === over.id);
    const reordered = arrayMove(announcements, oldIndex, newIndex);
    setAnnouncements(reordered);
    await fetch("/api/admin/announcements/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((row) => row.id) }),
    });
    toast.success(i18n("settings.announcementOrderUpdated"));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {i18n("settings.addAnnouncement")}
        </Button>
      </div>

      {announcements.length > 0 ? (
        <p className="text-sm text-[var(--admin-muted)]">
          {i18n("settings.announcementReorderHint")}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={announcements.map((row) => row.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-3">
            {announcements.map((row) => (
              <SortableAnnouncementRow
                key={row.id}
                row={row}
                locale={locale}
                onEdit={openEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent className="flex max-h-[90vh] flex-col gap-4 overflow-hidden p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {i18n(
                editingId
                  ? "settings.editAnnouncement"
                  : "settings.addAnnouncement"
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="-mx-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">
                  {i18n("settings.announcementText")}
                </h3>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid h-auto w-full grid-cols-2 gap-1.5 bg-transparent p-0 sm:grid-cols-3">
                    {LANGUAGES.map((lang) => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className={cn(
                          "h-auto w-full justify-start rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-2 shadow-none",
                          "data-[state=active]:border-[var(--admin-accent)] data-[state=active]:bg-[var(--admin-accent)]/5 data-[state=active]:shadow-none"
                        )}
                      >
                        <LanguageLabel
                          code={lang.code}
                          variant="compact"
                          className="truncate"
                        />
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {form.translations.map((translation, index) => (
                    <TabsContent
                      key={translation.language}
                      value={translation.language}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>{i18n("settings.announcementTitle")}</Label>
                        <Input
                          dir={
                            isRtlLanguage(translation.language) ? "rtl" : "ltr"
                          }
                          className={cn(
                            "text-start",
                            isRtlLanguage(translation.language) &&
                              "font-admin-fa"
                          )}
                          value={translation.title}
                          onChange={(e) => {
                            const translations = [...form.translations];
                            translations[index] = {
                              ...translation,
                              title: e.target.value,
                            };
                            setForm({ ...form, translations });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{i18n("settings.announcementMessage")}</Label>
                        <Textarea
                          dir={
                            isRtlLanguage(translation.language) ? "rtl" : "ltr"
                          }
                          className={cn(
                            "text-start",
                            isRtlLanguage(translation.language) &&
                              "font-admin-fa"
                          )}
                          rows={4}
                          value={translation.message}
                          onChange={(e) => {
                            const translations = [...form.translations];
                            translations[index] = {
                              ...translation,
                              message: e.target.value,
                            };
                            setForm({ ...form, translations });
                          }}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label>{i18n("settings.linkUrl")}</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <AdminNumericInput
                  label={i18n("settings.announcementDuration")}
                  hint={i18n("settings.announcementDurationHint")}
                  value={form.durationSeconds}
                  onChange={(value) =>
                    setForm({ ...form, durationSeconds: value })
                  }
                />
                <AdminNumericInput
                  label={i18n("settings.announcementMaxViews")}
                  hint={i18n("settings.announcementMaxViewsHint")}
                  value={form.maxDisplayCount}
                  onChange={(value) =>
                    setForm({ ...form, maxDisplayCount: value })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{i18n("common.active")}</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n("common.cancel")}
            </Button>
            <Button onClick={() => void saveAnnouncement()}>
              {i18n("common.save")}
            </Button>
          </DialogFooter>
        </AdminDialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AdminAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i18n("settings.deleteAnnouncementTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("settings.deleteAnnouncementDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void deleteAnnouncement()}>
              {i18n("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AdminAlertDialogContent>
      </AlertDialog>
    </div>
  );
}
