"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Database,
  Download,
  FileArchive,
  HardDrive,
  ImageIcon,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminT } from "@/lib/admin-i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AdminAlertDialogContent } from "@/components/admin/AdminPortal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BackupPanel() {
  const { t } = useAdminT();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function downloadBackup() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "khanemadary-backup.zip";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success(t("backup.downloadSuccess"));
    } catch {
      toast.error(t("backup.downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) setSelectedFile(file);
  }

  function openRestoreConfirm() {
    if (!selectedFile) {
      toast.error(t("backup.noFileSelected"));
      return;
    }
    setConfirmOpen(true);
  }

  async function restoreBackup() {
    if (!selectedFile) return;

    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        const key = data?.error ? `backup.errors.${data.error}` : "backup.restoreFailed";
        toast.error(t(key));
        return;
      }

      toast.success(t("backup.restoreSuccess"));
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setConfirmOpen(false);
    } catch {
      toast.error(t("backup.restoreFailed"));
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]/50 px-4 py-3">
        <p className="text-sm text-[var(--admin-muted)]">{t("backup.pageDesc")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--admin-border)]">
          <CardContent className="flex h-full flex-col space-y-5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-accent)]/15 text-[var(--admin-accent)]">
                <Download className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="text-base font-semibold text-[var(--admin-text)]">
                  {t("backup.exportTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--admin-muted)]">
                  {t("backup.exportDesc")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <Database className="h-3.5 w-3.5" />
                {t("backup.includesDatabase")}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 font-normal">
                <ImageIcon className="h-3.5 w-3.5" />
                {t("backup.includesMedia")}
              </Badge>
            </div>

            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)]/60 px-4 py-3">
              <div className="flex items-start gap-2.5 text-sm text-[var(--admin-muted)]">
                <FileArchive className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-accent)]" />
                <p>{t("backup.formatDesc")}</p>
              </div>
            </div>

            <div className="mt-auto pt-1">
              <Button
                className="w-full sm:w-auto"
                onClick={() => void downloadBackup()}
                disabled={downloading}
              >
                <Download className="me-2 h-4 w-4" />
                {downloading ? t("backup.downloading") : t("backup.download")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/[0.03]">
          <CardContent className="flex h-full flex-col space-y-5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h2 className="text-base font-semibold text-[var(--admin-text)]">
                  {t("backup.importTitle")}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--admin-muted)]">
                  {t("backup.importDesc")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-amber-300/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="leading-relaxed">{t("backup.warning")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-file">{t("backup.fileLabel")}</Label>
              <label
                htmlFor="backup-file"
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
                  dragOver
                    ? "border-[var(--admin-accent)] bg-[var(--admin-accent)]/5"
                    : "border-[var(--admin-border)] hover:border-[var(--admin-accent)]/50 hover:bg-[var(--admin-bg)]/40"
                )}
              >
                <HardDrive className="h-8 w-8 text-[var(--admin-muted)]" />
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    {selectedFile ? selectedFile.name : t("backup.dropHint")}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {selectedFile
                      ? formatFileSize(selectedFile.size)
                      : t("backup.fileTypes")}
                  </p>
                </div>
                <input
                  id="backup-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.db,application/zip,application/x-sqlite3,application/vnd.sqlite3,application/octet-stream"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="mt-auto pt-1">
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={openRestoreConfirm}
                disabled={!selectedFile || restoring}
              >
                <Upload className="me-2 h-4 w-4" />
                {restoring ? t("backup.restoring") : t("backup.restore")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--admin-border)]">
        <CardContent className="flex items-start gap-3 p-4">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-[var(--admin-muted)]" />
          <p className="text-xs leading-relaxed text-[var(--admin-muted)]">{t("backup.note")}</p>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AdminAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("backup.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("backup.confirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoring}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={restoring}
              onClick={(event) => {
                event.preventDefault();
                void restoreBackup();
              }}
            >
              {restoring ? t("backup.restoring") : t("backup.confirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AdminAlertDialogContent>
      </AlertDialog>
    </div>
  );
}
