"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
};

export function UserManager() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor",
  });
  const [editing, setEditing] = useState<User | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (editing) {
      await fetch(`/api/admin/users/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
    } else {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "editor" });
    load();
  }

  const myId = (session?.user as { id?: string })?.id;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="rounded-card border bg-card p-4 space-y-3">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        >
          <option value="editor">Editor</option>
          <option value="superadmin">Superadmin</option>
        </select>
        <button type="button" onClick={save} className="rounded-btn bg-accent px-4 py-2 text-white">
          {editing ? "Update User" : "Add User"}
        </button>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center gap-3 rounded-card border bg-card p-3">
            <div className="flex-1">
              <div className="font-semibold">{user.name ?? user.email}</div>
              <div className="text-sm text-secondary-text">
                {user.email} · {user.role}
              </div>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-btn border px-3"
              onClick={() => {
                setEditing(user);
                setForm({
                  name: user.name ?? "",
                  email: user.email,
                  password: "",
                  role: user.role,
                });
              }}
            >
              Edit
            </button>
            {user.id !== myId && (
              <button
                type="button"
                className="min-h-11 rounded-btn border border-red-300 px-3 text-red-600"
                onClick={async () => {
                  if (!confirm("Delete user?")) return;
                  await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
