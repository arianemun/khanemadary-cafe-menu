"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/admin-constants";
import { useAdminT } from "@/lib/admin-i18n";
import { cn, formatAdminDate, adminFaDigitClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

const emptyForm = () => ({
  name: "",
  email: "",
  password: "",
  role: "editor",
});

export function UserManager() {
  const { t: i18n, locale } = useAdminT();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm());

  const myId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      name: user.name ?? "",
      email: user.email,
      password: "",
      role: user.role,
    });
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/admin/users/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              role: form.role,
              ...(form.password ? { password: form.password } : {}),
            }),
          })
        : await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (!res.ok) throw new Error();
      toast.success(editing ? i18n("users.updated") : i18n("users.created"));
      setDialogOpen(false);
      setForm(emptyForm());
      load();
    } catch {
      toast.error(i18n("users.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {role === "superadmin" && (
        <div className="flex justify-end">
          <Button onClick={openCreate}>
            <Plus className="me-2 h-4 w-4" />
            {i18n("users.add")}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Users className="mb-3 h-10 w-10 text-[var(--admin-muted)]" />
          <p className="text-[var(--admin-muted)]">{i18n("users.empty")}</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-[var(--admin-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{i18n("common.user")}</TableHead>
                <TableHead>{i18n("common.role")}</TableHead>
                <TableHead className="hidden md:table-cell">{i18n("common.created")}</TableHead>
                <TableHead>{i18n("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name ?? "—"}</div>
                        <div className="text-xs text-[var(--admin-muted)]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin" ? "purple" : "blue"
                      }
                    >
                      {user.role === "superadmin" ? i18n("users.superAdmin") : i18n("users.editor")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={adminFaDigitClass(
                        locale,
                        locale === "fa"
                          ? "text-[13px] leading-relaxed text-[var(--admin-muted)]"
                          : "text-sm text-[var(--admin-muted)]"
                      )}
                    >
                      {formatAdminDate(user.createdAt, locale)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(user)}
                        aria-label={i18n("common.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[var(--admin-danger)] hover:text-red-700"
                        disabled={user.id === myId}
                        onClick={() => setDeleteId(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AdminDialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? i18n("users.edit") : i18n("users.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{i18n("common.name")}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{i18n("common.email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>
                {i18n("common.password")}
                {editing && ` (${i18n("common.optional")})`}
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className={cn(locale === "fa" ? "pl-10" : "pr-10")}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2",
                    locale === "fa" ? "left-3" : "right-3"
                  )}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? i18n("users.hidePassword") : i18n("users.showPassword")}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[var(--admin-muted)]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[var(--admin-muted)]" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{i18n("common.role")}</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v })}
                disabled={editing?.id === myId}
              >
                <SelectTrigger
                  dir={locale === "fa" ? "rtl" : "ltr"}
                  className={cn(
                    locale === "fa" && "text-start [&>span]:w-full [&>span]:text-start"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={locale === "fa" ? "rtl" : "ltr"}>
                  <SelectItem value="editor" className={locale === "fa" ? "text-start" : undefined}>
                    {i18n("users.editor")}
                  </SelectItem>
                  <SelectItem value="superadmin" className={locale === "fa" ? "text-start" : undefined}>
                    {i18n("users.superAdmin")}
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>{i18n("users.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("users.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--admin-danger)] hover:bg-red-700"
              onClick={async () => {
                if (!deleteId) return;
                await fetch(`/api/admin/users/${deleteId}`, { method: "DELETE" });
                setDeleteId(null);
                toast.success(i18n("users.deleted"));
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
