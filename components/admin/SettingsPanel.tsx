"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LANGUAGES } from "@/lib/constants";

const WEEKDAYS = [
  { key: "sat", label: "شنبه" },
  { key: "sun", label: "یک‌شنبه" },
  { key: "mon", label: "دوشنبه" },
  { key: "tue", label: "سه‌شنبه" },
  { key: "wed", label: "چهارشنبه" },
  { key: "thu", label: "پنج‌شنبه" },
  { key: "fri", label: "جمعه" },
];

type EventRow = {
  id: string;
  image: string | null;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
};

type DayHours = {
  open: boolean;
  start: string;
  end: string;
};

export function SettingsPanel() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tab, setTab] = useState("general");
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    image: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  async function load() {
    const [settingsRes, eventsRes] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/admin/events"),
    ]);
    setSettings(await settingsRes.json());
    if (eventsRes.ok) setEvents(await eventsRes.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(partial: Record<string, unknown>) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    load();
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string;
  }

  const general = (settings.general ?? {}) as Record<string, unknown>;
  const contact = (settings.contact ?? {}) as Record<string, unknown>;
  const maps = (settings.maps ?? {}) as Record<string, string>;
  const languages = (settings.languages ?? {}) as {
    enabled?: string[];
    default?: string;
  };
  const workingHours = (contact.workingHours ?? {}) as Record<string, unknown>;
  const days = (workingHours.days ?? {}) as Record<string, DayHours>;

  const tabs = ["general", "events", "contact", "maps", "languages"];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-11 rounded-btn border px-4 capitalize ${tab === t ? "bg-accent text-white" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="space-y-3 rounded-card border bg-card p-4">
          <input
            placeholder="Cafe name (FA)"
            defaultValue={general.cafeName as string}
            onBlur={(e) => save({ general: { ...general, cafeName: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Cafe name (EN)"
            defaultValue={general.cafeNameEn as string}
            onBlur={(e) => save({ general: { ...general, cafeNameEn: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <div className="flex items-center gap-3">
            {typeof general.logo === "string" && general.logo && (
              <Image src={general.logo} alt="" width={48} height={48} className="rounded-full object-cover" />
            )}
            <input
              placeholder="Logo URL"
              defaultValue={general.logo as string}
              onBlur={(e) => save({ general: { ...general, logo: e.target.value } })}
              className="flex-1 rounded-btn border px-3 py-2"
            />
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadFile(file);
                save({ general: { ...general, logo: url } });
              }}
            />
          </div>
          <textarea
            placeholder="Welcome message (FA)"
            defaultValue={general.welcomeMessageFa as string}
            onBlur={(e) =>
              save({ general: { ...general, welcomeMessageFa: e.target.value } })
            }
            className="w-full rounded-btn border px-3 py-2"
            rows={3}
          />
          <textarea
            placeholder="Welcome message (EN)"
            defaultValue={general.welcomeMessageEn as string}
            onBlur={(e) =>
              save({ general: { ...general, welcomeMessageEn: e.target.value } })
            }
            className="w-full rounded-btn border px-3 py-2"
            rows={3}
          />
          <textarea
            placeholder="Announcement text"
            defaultValue={(general.announcement as { text?: string })?.text ?? ""}
            onBlur={(e) =>
              save({
                general: {
                  ...general,
                  announcement: {
                    ...(general.announcement as object),
                    text: e.target.value,
                    enabled: Boolean(e.target.value),
                  },
                },
              })
            }
            className="w-full rounded-btn border px-3 py-2"
            rows={2}
          />
          <input
            type="color"
            defaultValue={(general.announcement as { color?: string })?.color ?? "#3f51b5"}
            onChange={(e) =>
              save({
                general: {
                  ...general,
                  announcement: {
                    ...(general.announcement as object),
                    color: e.target.value,
                  },
                },
              })
            }
            className="h-11 w-20"
          />
          <input
            placeholder="Announcement link URL"
            defaultValue={(general.announcement as { link?: string })?.link ?? ""}
            onBlur={(e) =>
              save({
                general: {
                  ...general,
                  announcement: {
                    ...(general.announcement as object),
                    link: e.target.value,
                  },
                },
              })
            }
            className="w-full rounded-btn border px-3 py-2"
          />
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-4">
          <div className="space-y-3 rounded-card border bg-card p-4">
            <h2 className="font-semibold">Add Event</h2>
            <input
              placeholder="Title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full rounded-btn border px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full rounded-btn border px-3 py-2"
              rows={2}
            />
            <input
              placeholder="Image URL"
              value={eventForm.image}
              onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
              className="w-full rounded-btn border px-3 py-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await uploadFile(file);
                setEventForm({ ...eventForm, image: url });
              }}
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                className="rounded-btn border px-3 py-2"
              />
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                className="rounded-btn border px-3 py-2"
              />
            </div>
            <button
              type="button"
              className="rounded-btn bg-accent px-4 py-2 text-white"
              onClick={async () => {
                await fetch("/api/admin/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(eventForm),
                });
                setEventForm({ title: "", description: "", image: "", startDate: "", endDate: "", isActive: true });
                load();
              }}
            >
              Add Event
            </button>
          </div>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={event.id} className="flex flex-wrap items-center gap-3 rounded-card border bg-card p-3">
                {event.image && (
                  <Image src={event.image} alt="" width={48} height={48} className="rounded-card object-cover" />
                )}
                <div className="flex-1">
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs text-secondary-text">{event.description}</div>
                </div>
                <button
                  type="button"
                  className="min-h-11 rounded-btn border px-3"
                  disabled={index === 0}
                  onClick={async () => {
                    const ids = [...events];
                    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                    await fetch("/api/admin/events/reorder", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids: ids.map((e) => e.id) }),
                    });
                    load();
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-btn border px-3"
                  disabled={index === events.length - 1}
                  onClick={async () => {
                    const ids = [...events];
                    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
                    await fetch("/api/admin/events/reorder", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ids: ids.map((e) => e.id) }),
                    });
                    load();
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-btn border px-3"
                  onClick={async () => {
                    await fetch(`/api/admin/events/${event.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...event, isActive: !event.isActive }),
                    });
                    load();
                  }}
                >
                  {event.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-btn border border-red-300 px-3 text-red-600"
                  onClick={async () => {
                    if (!confirm("Delete event?")) return;
                    await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div className="space-y-3 rounded-card border bg-card p-4">
          <input
            placeholder="Phone"
            defaultValue={contact.phone as string}
            onBlur={(e) => save({ contact: { ...contact, phone: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Instagram"
            defaultValue={contact.instagram as string}
            onBlur={(e) => save({ contact: { ...contact, instagram: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Telegram"
            defaultValue={contact.telegram as string}
            onBlur={(e) => save({ contact: { ...contact, telegram: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Email"
            defaultValue={contact.email as string}
            onBlur={(e) => save({ contact: { ...contact, email: e.target.value } })}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Address (FA)"
            defaultValue={((contact.places as { address?: string }[])?.[0]?.address) ?? ""}
            onBlur={(e) => {
              const places = (contact.places as object[]) ?? [{}];
              const first = { ...(places[0] as object), address: e.target.value };
              save({ contact: { ...contact, places: [first, ...places.slice(1)] } });
            }}
            className="w-full rounded-btn border px-3 py-2"
          />
          <input
            placeholder="Address (EN)"
            defaultValue={((contact.places as { title?: string }[])?.[0]?.title) ?? ""}
            onBlur={(e) => {
              const places = (contact.places as object[]) ?? [{}];
              const first = { ...(places[0] as object), title: e.target.value };
              save({ contact: { ...contact, places: [first, ...places.slice(1)] } });
            }}
            className="w-full rounded-btn border px-3 py-2"
          />
          <textarea
            placeholder="Special notes (e.g. Ramadan hours)"
            defaultValue={workingHours.note as string}
            onBlur={(e) =>
              save({
                contact: {
                  ...contact,
                  workingHours: { ...workingHours, note: e.target.value },
                },
              })
            }
            className="w-full rounded-btn border px-3 py-2"
            rows={2}
          />
          <h3 className="font-semibold">Working Hours</h3>
          {WEEKDAYS.map(({ key, label }) => {
            const day = days[key] ?? { open: true, start: "08:00", end: "23:00" };
            return (
              <div key={key} className="flex flex-wrap items-center gap-2">
                <label className="flex min-h-11 min-w-[80px] items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={day.open}
                    onChange={(e) =>
                      save({
                        contact: {
                          ...contact,
                          workingHours: {
                            ...workingHours,
                            days: { ...days, [key]: { ...day, open: e.target.checked } },
                          },
                        },
                      })
                    }
                  />
                  {label}
                </label>
                <input
                  type="time"
                  defaultValue={day.start}
                  onBlur={(e) =>
                    save({
                      contact: {
                        ...contact,
                        workingHours: {
                          ...workingHours,
                          days: { ...days, [key]: { ...day, start: e.target.value } },
                        },
                      },
                    })
                  }
                  className="rounded-btn border px-2 py-1"
                />
                <input
                  type="time"
                  defaultValue={day.end}
                  onBlur={(e) =>
                    save({
                      contact: {
                        ...contact,
                        workingHours: {
                          ...workingHours,
                          days: { ...days, [key]: { ...day, end: e.target.value } },
                        },
                      },
                    })
                  }
                  className="rounded-btn border px-2 py-1"
                />
              </div>
            );
          })}
        </div>
      )}

      {tab === "maps" && (
        <div className="space-y-3 rounded-card border bg-card p-4">
          {["google", "waze", "neshan", "balad"].map((key) => (
            <input
              key={key}
              placeholder={`${key} URL`}
              defaultValue={maps[key] ?? ""}
              onBlur={(e) => save({ maps: { ...maps, [key]: e.target.value } })}
              className="w-full rounded-btn border px-3 py-2"
            />
          ))}
        </div>
      )}

      {tab === "languages" && (
        <div className="space-y-3 rounded-card border bg-card p-4">
          {LANGUAGES.map((lang) => (
            <label key={lang.code} className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                defaultChecked={languages.enabled?.includes(lang.code)}
                onChange={(e) => {
                  const enabled = new Set(languages.enabled ?? LANGUAGES.map((l) => l.code));
                  if (e.target.checked) enabled.add(lang.code);
                  else enabled.delete(lang.code);
                  save({
                    languages: {
                      ...languages,
                      enabled: Array.from(enabled),
                    },
                  });
                }}
              />
              {lang.label}
            </label>
          ))}
          <select
            defaultValue={languages.default ?? "fa"}
            onChange={(e) =>
              save({ languages: { ...languages, default: e.target.value } })
            }
            className="w-full rounded-btn border px-3 py-2"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
