"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LANGUAGES } from "@/lib/constants";

type Item = {
  id: string;
  categoryId: string | null;
  mainImage: string | null;
  galleryImages: string;
  basePrice: number;
  isActive: boolean;
  isAvailable: boolean;
  translations: { language: string; name: string; description?: string | null; ingredients?: string | null }[];
  category?: { translations: { language: string; name: string }[] };
};

type Category = { id: string; slug: string; translations: { language: string; name: string }[] };

export function ItemManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({
    categoryId: "",
    mainImage: "",
    galleryImages: [] as string[],
    basePrice: 0,
    isActive: true,
    isAvailable: true,
    translations: LANGUAGES.map((l) => ({
      language: l.code,
      name: "",
      description: "",
      ingredients: "",
    })),
  });

  async function load() {
    const [itemsRes, catsRes] = await Promise.all([
      fetch(`/api/admin/items?q=${encodeURIComponent(filter)}&categoryId=${categoryFilter}`),
      fetch("/api/admin/categories"),
    ]);
    setItems(await itemsRes.json());
    setCategories(await catsRes.json());
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, categoryFilter]);

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  }

  async function save() {
    const payload = { ...form, galleryImages: form.galleryImages };
    if (editing) {
      await fetch(`/api/admin/items/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setEditing(null);
    load();
  }

  const grouped = categories.map((cat) => ({
    cat,
    items: items.filter((i) => i.categoryId === cat.id),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Menu Items</h1>
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-btn border px-3 py-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-btn border px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.translations.find((t) => t.language === "fa")?.name ?? c.slug}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-card border border-border bg-card p-4 space-y-3">
        <h2 className="font-semibold">{editing ? "Edit Item" : "Add Item"}</h2>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.translations.find((t) => t.language === "fa")?.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Price"
          value={form.basePrice}
          onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <input
          placeholder="Image URL"
          value={form.mainImage}
          onChange={(e) => setForm({ ...form, mainImage: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await uploadFile(file);
            setForm({ ...form, mainImage: url });
          }}
        />
        {form.translations.map((t, i) => (
          <div key={t.language} className="space-y-1 rounded-btn border p-2">
            <input
              placeholder={`Name (${t.language})`}
              value={t.name}
              onChange={(e) => {
                const translations = [...form.translations];
                translations[i] = { ...t, name: e.target.value };
                setForm({ ...form, translations });
              }}
              className="w-full rounded-btn border px-3 py-2"
            />
            <textarea
              placeholder={`Description (${t.language})`}
              value={t.description ?? ""}
              onChange={(e) => {
                const translations = [...form.translations];
                translations[i] = { ...t, description: e.target.value };
                setForm({ ...form, translations });
              }}
              className="w-full rounded-btn border px-3 py-2"
              rows={2}
            />
            <textarea
              placeholder={`Ingredients (${t.language})`}
              value={t.ingredients ?? ""}
              onChange={(e) => {
                const translations = [...form.translations];
                translations[i] = { ...t, ingredients: e.target.value };
                setForm({ ...form, translations });
              }}
              className="w-full rounded-btn border px-3 py-2"
              rows={2}
            />
          </div>
        ))}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Gallery Images</h3>
          {form.galleryImages.map((url, gi) => (
            <div key={`${url}-${gi}`} className="flex items-center gap-2">
              <Image src={url} alt="" width={40} height={40} className="rounded-card object-cover" />
              <span className="flex-1 truncate text-xs">{url}</span>
              <button
                type="button"
                className="min-h-11 rounded-btn border px-2"
                disabled={gi === 0}
                onClick={() => {
                  const gallery = [...form.galleryImages];
                  [gallery[gi - 1], gallery[gi]] = [gallery[gi], gallery[gi - 1]];
                  setForm({ ...form, galleryImages: gallery });
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className="min-h-11 rounded-btn border px-2"
                disabled={gi === form.galleryImages.length - 1}
                onClick={() => {
                  const gallery = [...form.galleryImages];
                  [gallery[gi], gallery[gi + 1]] = [gallery[gi + 1], gallery[gi]];
                  setForm({ ...form, galleryImages: gallery });
                }}
              >
                ↓
              </button>
              <button
                type="button"
                className="min-h-11 rounded-btn border border-red-300 px-2 text-red-600"
                onClick={() => {
                  setForm({
                    ...form,
                    galleryImages: form.galleryImages.filter((_, j) => j !== gi),
                  });
                }}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const urls: string[] = [];
              for (const file of files) {
                urls.push(await uploadFile(file));
              }
              setForm({ ...form, galleryImages: [...form.galleryImages, ...urls] });
            }}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
            />
            Available
          </label>
        </div>
        <button type="button" onClick={save} className="rounded-btn bg-accent px-4 py-2 text-white">
          Save
        </button>
      </div>

      {grouped.map(({ cat, items: catItems }) => (
        <div key={cat.id}>
          <h3 className="mb-2 font-bold">
            {cat.translations.find((t) => t.language === "fa")?.name}
          </h3>
          <div className="space-y-2">
            {catItems.map((item) => {
              const name = item.translations.find((t) => t.language === "fa")?.name;
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-card border bg-card p-3"
                >
                  {item.mainImage && (
                    <Image src={item.mainImage} alt="" width={48} height={48} className="rounded-card object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm text-secondary-text">
                      {item.basePrice.toLocaleString()} تومان
                    </div>
                  </div>
                  <button
                    type="button"
                    className="min-h-11 rounded-btn border px-3"
                    onClick={async () => {
                      await fetch(`/api/admin/items/${item.id}/toggle-active`, { method: "PATCH" });
                      load();
                    }}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-btn border px-3"
                    onClick={async () => {
                      await fetch(`/api/admin/items/${item.id}/toggle-available`, { method: "PATCH" });
                      load();
                    }}
                  >
                    {item.isAvailable ? "In stock" : "Out"}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-btn border px-3"
                    onClick={() => {
                      setEditing(item);
                      setForm({
                        categoryId: item.categoryId ?? "",
                        mainImage: item.mainImage ?? "",
                        galleryImages: JSON.parse(item.galleryImages || "[]"),
                        basePrice: item.basePrice,
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
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="min-h-11 rounded-btn border border-red-300 px-3 text-red-600"
                    onClick={async () => {
                      if (!confirm("Delete item?")) return;
                      await fetch(`/api/admin/items/${item.id}`, { method: "DELETE" });
                      load();
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
