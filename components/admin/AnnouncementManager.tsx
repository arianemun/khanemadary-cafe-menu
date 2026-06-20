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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

type AnnouncementRow = {
  id: string;
  titleFa: string | null;
  titleEn: string | null;
  messageFa: string | null;
  messageEn: string | null;
  color: string;
  link: string | null;
  durationSeconds: number;
  maxDisplayCount: number;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm = () => ({
  titleFa: "",
  titleEn: "",
  messageFa: "",
  messageEn: "",
  color: "#3F51B5",
  link: "",
  durationSeconds: "10",
  maxDisplayCount: "1",
  isActive: true,
});

function SortableAnnouncementRow({
  row,
  locale,
  onEdit,
  onDelete,
}: {
  row: AnnouncementRow;
  locale: string;
  onEdit: (row: AnnouncementRow) => void;
  onDelete: (id: string) => void;
}) {
  const { t: i18n } = useAdminT();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });

  const title =
    locale === "fa"
      ? (row.titleFa ?? row.titleEn ?? "")
      : (row.titleEn ?? row.titleFa ?? "");
  const message =
    locale === "fa"
      ? (row.messageFa ?? row.messageEn ?? "")
      : (row.messageEn ?? row.messageFa ?? "");

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
    setDialogOpen(true);
  }

  function openEdit(row: AnnouncementRow) {
    setEditingId(row.id);
    setForm({
      titleFa: row.titleFa ?? "",
      titleEn: row.titleEn ?? "",
      messageFa: row.messageFa ?? "",
      messageEn: row.messageEn ?? "",
      color: row.color ?? "#3F51B5",
      link: row.link ?? "",
      durationSeconds: String(row.durationSeconds),
      maxDisplayCount: String(row.maxDisplayCount),
      isActive: row.isActive,
    });
    setDialogOpen(true);
  }

  async function saveAnnouncement() {
    const payload = {
      titleFa: form.titleFa || null,
      titleEn: form.titleEn || null,
      messageFa: form.messageFa || null,
      messageEn: form.messageEn || null,
      color: form.color,
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
        <AdminDialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {i18n(
                editingId
                  ? "settings.editAnnouncement"
                  : "settings.addAnnouncement"
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  <LanguageLabel code="fa" /> — {i18n("settings.announcementTitle")}
                </Label>
                <Input
                  value={form.titleFa}
                  className="font-admin-fa"
                  onChange={(e) =>
                    setForm({ ...form, titleFa: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  <LanguageLabel code="en" /> — {i18n("settings.announcementTitle")}
                </Label>
                <Input
                  value={form.titleEn}
                  onChange={(e) =>
                    setForm({ ...form, titleEn: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  <LanguageLabel code="fa" /> — {i18n("settings.announcementMessage")}
                </Label>
                <Textarea
                  value={form.messageFa}
                  className="font-admin-fa"
                  onChange={(e) =>
                    setForm({ ...form, messageFa: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  <LanguageLabel code="en" /> — {i18n("settings.announcementMessage")}
                </Label>
                <Textarea
                  value={form.messageEn}
                  onChange={(e) =>
                    setForm({ ...form, messageEn: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Label>{i18n("settings.bgColor")}</Label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-16 rounded border"
              />
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
          <DialogFooter>
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
