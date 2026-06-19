"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = [
  { value: 6, label: "شنبه" },
  { value: 0, label: "یک‌شنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنج‌شنبه" },
  { value: 5, label: "جمعه" },
];

type Discount = {
  id: string;
  itemId: string;
  type: string;
  value: number;
  startDate: string | null;
  endDate: string | null;
  weekdays: string;
  isActive: boolean;
  item?: { translations: { language: string; name: string }[] };
};

type MenuItem = { id: string; translations: { language: string; name: string }[] };

export function DiscountManager() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState({
    itemId: "",
    type: "percentage",
    value: 10,
    scheduleType: "always" as "always" | "range" | "weekdays",
    startDate: "",
    endDate: "",
    weekdays: [] as number[],
  });

  async function load() {
    const [dRes, iRes] = await Promise.all([
      fetch("/api/admin/discounts"),
      fetch("/api/admin/items"),
    ]);
    setDiscounts(await dRes.json());
    setItems(await iRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: form.itemId,
        type: form.type,
        value: form.value,
        startDate: form.scheduleType === "range" ? form.startDate : null,
        endDate: form.scheduleType === "range" ? form.endDate : null,
        weekdays: form.scheduleType === "weekdays" ? form.weekdays : [],
      }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Discounts</h1>
      <div className="rounded-card border bg-card p-4 space-y-3">
        <select
          value={form.itemId}
          onChange={(e) => setForm({ ...form, itemId: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        >
          <option value="">Select item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.translations.find((t) => t.language === "fa")?.name}
            </option>
          ))}
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-btn border px-3 py-2"
        >
          <option value="percentage">Percentage %</option>
          <option value="fixed">Fixed amount (تومان)</option>
        </select>
        <input
          type="number"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          className="w-full rounded-btn border px-3 py-2"
        />
        <select
          value={form.scheduleType}
          onChange={(e) =>
            setForm({
              ...form,
              scheduleType: e.target.value as "always" | "range" | "weekdays",
            })
          }
          className="w-full rounded-btn border px-3 py-2"
        >
          <option value="always">Always active</option>
          <option value="range">Date range</option>
          <option value="weekdays">Specific weekdays</option>
        </select>
        {form.scheduleType === "range" && (
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="flex-1 rounded-btn border px-3 py-2"
            />
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="flex-1 rounded-btn border px-3 py-2"
            />
          </div>
        )}
        {form.scheduleType === "weekdays" && (
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => {
                  const weekdays = form.weekdays.includes(day.value)
                    ? form.weekdays.filter((d) => d !== day.value)
                    : [...form.weekdays, day.value];
                  setForm({ ...form, weekdays });
                }}
                className={`min-h-11 rounded-btn border px-3 ${form.weekdays.includes(day.value) ? "bg-accent text-white" : ""}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={save} className="rounded-btn bg-accent px-4 py-2 text-white">
          Add Discount
        </button>
      </div>
      <div className="space-y-2">
        {discounts.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-card border bg-card p-3">
            <div className="flex-1">
              <div className="font-semibold">
                {d.item?.translations.find((t) => t.language === "fa")?.name}
              </div>
              <div className="text-sm text-secondary-text">
                {d.type === "percentage" ? `${d.value}%` : `${d.value} تومان`}
              </div>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-btn border px-3"
              onClick={async () => {
                await fetch(`/api/admin/discounts/${d.id}/toggle`, { method: "PATCH" });
                load();
              }}
            >
              {d.isActive ? "Active" : "Inactive"}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-btn border border-red-300 px-3 text-red-600"
              onClick={async () => {
                if (!confirm("Delete discount?")) return;
                await fetch(`/api/admin/discounts/${d.id}`, { method: "DELETE" });
                load();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
