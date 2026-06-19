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
import { LANGUAGES } from "@/lib/constants";

type Category = {
  id: string;
  slug: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  translations: { language: string; name: string }[];
  _count?: { items: number };
};

function SortableRow({
  category,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: Category;
  onToggle: (id: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });
  const faName =
    category.translations.find((t) => t.language === "fa")?.name ?? category.slug;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-card border border-border bg-card p-3"
    >
      <button type="button" className="cursor-grab px-2 text-secondary-text" {...attributes} {...listeners}>
        ⋮⋮
      </button>
      <span className="text-2xl">{category.icon || "📁"}</span>
      <div className="flex-1">
        <div className="font-semibold">{faName}</div>
        <div className="text-xs text-secondary-text">
          {category.slug} · {category._count?.items ?? 0} items
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggle(category.id)}
        className={`min-h-11 min-w-11 rounded-btn px-3 text-sm ${category.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
      >
        {category.isActive ? "Active" : "Inactive"}
      </button>
      <button type="button" onClick={() => onEdit(category)} className="min-h-11 rounded-btn border px-3">
        Edit
      </button>
      <button type="button" onClick={() => onDelete(category.id)} className="min-h-11 rounded-btn border border-red-300 px-3 text-red-600">
        Delete
      </button>
    </div>
  );
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    slug: "",
    icon: "☕",
    translations: LANGUAGES.map((l) => ({ language: l.code, name: "" })),
  });

  const sensors = useSensors(useSensor(PointerSensor));

  async function load() {
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (editing) {
      await fetch(`/api/admin/categories/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setEditing(null);
    setForm({
      slug: "",
      icon: "☕",
      translations: LANGUAGES.map((l) => ({ language: l.code, name: "" })),
    });
    load();
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
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="rounded-card border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold">{editing ? "Edit Category" : "Add Category"}</h2>
        <input
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <input
          placeholder="icon emoji"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        {form.translations.map((t, i) => (
          <input
            key={t.language}
            placeholder={`Name (${t.language})`}
            value={t.name}
            onChange={(e) => {
              const translations = [...form.translations];
              translations[i] = { ...t, name: e.target.value };
              setForm({ ...form, translations });
            }}
            className="w-full rounded-btn border px-3 py-2"
          />
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={save} className="rounded-btn bg-accent px-4 py-2 text-white">
            Save
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} className="rounded-btn border px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <SortableRow
                key={cat.id}
                category={cat}
                onToggle={async (id) => {
                  await fetch(`/api/admin/categories/${id}/toggle`, { method: "PATCH" });
                  load();
                }}
                onEdit={(c) => {
                  setEditing(c);
                  setForm({
                    slug: c.slug,
                    icon: c.icon ?? "",
                    translations: LANGUAGES.map((l) => ({
                      language: l.code,
                      name:
                        c.translations.find((t) => t.language === l.code)?.name ?? "",
                    })),
                  });
                }}
                onDelete={async (id) => {
                  if (!confirm("Delete category?")) return;
                  await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
                  load();
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
