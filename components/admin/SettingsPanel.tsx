"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
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
import {
  CalendarDays,
  Clock,
  Globe,
  GripVertical,
  Megaphone,
  Pencil,
  Phone,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_MENU_COLOR, LANGUAGES } from "@/lib/constants";
import {
  DEFAULT_MENU_MAX_WIDTH,
  MENU_MAX_WIDTH_PRESETS,
} from "@/lib/menu-width";
import {
  elementBorderRadiusToCssVars,
  MAX_ELEMENT_BORDER_RADIUS,
  MIN_ELEMENT_BORDER_RADIUS,
  resolveElementBorderRadius,
} from "@/lib/element-radius";
import {
  MAX_HERO_OVERLAY_OPACITY,
  MIN_HERO_OVERLAY_OPACITY,
  resolveHeroOverlayOpacity,
} from "@/lib/hero-overlay";
import {
  DEFAULT_WORLD_CUP_DATA_URL,
  DEFAULT_WORLD_CUP_TIMEZONE,
  normalizeWorldCupSettings,
} from "@/lib/world-cup-settings";
import {
  MAX_EVENT_OVERLAY_OPACITY,
  MIN_EVENT_OVERLAY_OPACITY,
  resolveEventOverlayOpacity,
} from "@/lib/event-overlay";
import { LanguageLabel } from "@/components/admin/LanguageLabel";
import { AnnouncementManager } from "@/components/admin/AnnouncementManager";
import { UploadProgressBar } from "@/components/admin/UploadProgressBar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { MapProviderLabel } from "@/components/admin/MapProviderLabel";
import { useAdminT } from "@/lib/admin-i18n";
import {
  MAP_PROVIDER_KEYS,
  normalizeMapsSettings,
  type MapProviderKey,
} from "@/lib/maps-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminTimePicker } from "@/components/admin/AdminTimePicker";
import { AdminDatePicker } from "@/components/admin/AdminDatePicker";
import {
  AdminLocaleDigitInput,
  AdminLocaleDigitTextarea,
} from "@/components/admin/AdminDigits";
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
import {
  adminFaDigitClass,
  cn,
  formatAdminDate,
  formatAdminDigits,
  normalizeAdminDigits,
} from "@/lib/utils";
import {
  getPlaceTranslations,
  updatePlaceTranslation,
  type StoredPlace,
} from "@/lib/contact-places";
import { resolveEventMediaType } from "@/lib/event-media";

const WEEKDAY_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

const SETTINGS_TABS = [
  { id: "general", icon: Store },
  { id: "announcement", icon: Megaphone },
  { id: "events", icon: CalendarDays },
  { id: "contact", icon: Phone },
  { id: "hours", icon: Clock },
  { id: "languages", icon: Globe },
] as const;

const MAP_PROVIDERS: { key: MapProviderKey; labelKey: string }[] = [
  { key: "google", labelKey: "settings.mapsGoogle" },
  { key: "waze", labelKey: "settings.mapsWaze" },
  { key: "neshan", labelKey: "settings.mapsNeshan" },
  { key: "balad", labelKey: "settings.mapsBalad" },
];

type TabId = (typeof SETTINGS_TABS)[number]["id"];

type EventRow = {
  id: string;
  image: string | null;
  video: string | null;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  overlayOpacity: number;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY_EVENT_FORM = {
  title: "",
  description: "",
  image: "",
  video: "",
  startDate: "",
  endDate: "",
  overlayOpacity: resolveEventOverlayOpacity(undefined),
  isActive: true,
};

function toDateInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatEventDateRange(
  startDate: string | null,
  endDate: string | null,
  locale: "fa" | "en"
) {
  if (!startDate && !endDate) return null;
  const start = startDate ? formatAdminDate(startDate, locale) : null;
  const end = endDate ? formatAdminDate(endDate, locale) : null;
  if (start && end) {
    return locale === "fa"
      ? `${formatAdminDigits(start, "fa")} – ${formatAdminDigits(end, "fa")}`
      : `${start} – ${end}`;
  }
  return locale === "fa"
    ? formatAdminDigits(start ?? end ?? "", "fa")
    : start ?? end;
}

function SortableEventCard({
  event,
  locale,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  event: EventRow;
  locale: "fa" | "en";
  onToggleActive: (event: EventRow, isActive: boolean) => void;
  onEdit: (event: EventRow) => void;
  onDelete: (id: string) => void;
}) {
  const { t: i18n } = useAdminT();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: event.id });
  const dateRange = formatEventDateRange(event.startDate, event.endDate, locale);

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        <button
          type="button"
          className="cursor-grab text-[var(--admin-muted)]"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
          {event.video ? (
            <video
              src={event.video}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          ) : event.image ? (
            <Image src={event.image} alt="" fill className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{event.title}</div>
          {event.description && (
            <div
              className={cn(
                "text-sm text-[var(--admin-muted)]",
                locale === "fa" && "font-admin-fa text-start"
              )}
            >
              {formatAdminDigits(event.description, locale)}
            </div>
          )}
          {dateRange && (
            <div
              className={adminFaDigitClass(
                locale,
                "mt-1 text-xs text-[var(--admin-muted)]"
              )}
            >
              {dateRange}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`event-active-${event.id}`} className="sr-only">
            {i18n("common.active")}
          </Label>
          <Switch
            id={`event-active-${event.id}`}
            checked={event.isActive}
            onCheckedChange={(v) => onToggleActive(event, v)}
          />
          <Badge variant={event.isActive ? "success" : "secondary"}>
            {event.isActive ? i18n("common.active") : i18n("common.inactive")}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={i18n("common.edit")}
          onClick={() => onEdit(event)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-[var(--admin-danger)]"
          aria-label={i18n("common.delete")}
          onClick={() => onDelete(event.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

type DayHours = { open: boolean; start: string; end: string };

const SLIDER_SAVE_DEBOUNCE_MS = 600;

function DebouncedRangeSlider({
  id,
  value,
  onSave,
  min,
  max,
  step = 1,
  debounceMs = SLIDER_SAVE_DEBOUNCE_MS,
  label,
  description,
  formatValue,
  minHint,
  maxHint,
  onDraftChange,
}: {
  id: string;
  value: number;
  onSave: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  debounceMs?: number;
  label: ReactNode;
  description?: ReactNode;
  formatValue: (value: number, locale: "fa" | "en") => string;
  minHint?: ReactNode;
  maxHint?: ReactNode;
  onDraftChange?: (value: number) => void;
}) {
  const { locale } = useAdminT();
  const [draft, setDraft] = useState(value);
  const lastSaved = useRef(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef(value);

  useEffect(() => {
    setDraft(value);
    draftRef.current = value;
    lastSaved.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const commit = useCallback(
    (next: number) => {
      if (next === lastSaved.current) return;
      lastSaved.current = next;
      onSave(next);
    },
    [onSave]
  );

  const flushCommit = useCallback(
    (next = draftRef.current) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      commit(next);
    },
    [commit]
  );

  const scheduleCommit = useCallback(
    (next: number) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        commit(next);
      }, debounceMs);
    },
    [commit, debounceMs]
  );

  function handleChange(next: number) {
    setDraft(next);
    draftRef.current = next;
    onDraftChange?.(next);
    scheduleCommit(next);
  }

  function handlePointerUp(next: number) {
    setDraft(next);
    draftRef.current = next;
    onDraftChange?.(next);
    flushCommit(next);
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--admin-border)] px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id} className="font-admin-fa">
          {label}
        </Label>
        <span
          className={adminFaDigitClass(
            locale,
            "shrink-0 text-sm tabular-nums text-[var(--admin-muted)]"
          )}
        >
          {formatValue(draft, locale)}
        </span>
      </div>
      {description ? (
        <p className="text-xs text-[var(--admin-muted)]">{description}</p>
      ) : null}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(e) => handleChange(Number(e.target.value))}
        onPointerUp={(e) => handlePointerUp(Number(e.currentTarget.value))}
        onBlur={() => flushCommit()}
        className="h-2 w-full cursor-pointer accent-[var(--admin-accent)]"
      />
      {minHint || maxHint ? (
        <div className="flex justify-between text-xs text-[var(--admin-muted)]">
          {minHint ? <span>{minHint}</span> : <span />}
          {maxHint ? <span>{maxHint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function ElementBorderRadiusSlider({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => void;
}) {
  const { t: i18n } = useAdminT();

  const applyPreviewCssVars = useCallback((radius: number) => {
    const vars = elementBorderRadiusToCssVars(radius);
    for (const [key, cssValue] of Object.entries(vars)) {
      document.documentElement.style.setProperty(key, cssValue);
    }
  }, []);

  useEffect(() => {
    return () => {
      const vars = elementBorderRadiusToCssVars(value);
      for (const [key, cssValue] of Object.entries(vars)) {
        document.documentElement.style.setProperty(key, cssValue);
      }
    };
  }, [value]);

  return (
    <DebouncedRangeSlider
      id="element-border-radius"
      value={value}
      onSave={onSave}
      min={MIN_ELEMENT_BORDER_RADIUS}
      max={MAX_ELEMENT_BORDER_RADIUS}
      label={i18n("settings.elementBorderRadius")}
      description={i18n("settings.elementBorderRadiusDesc")}
      formatValue={(v, locale) =>
        `${formatAdminDigits(String(v), locale)}px`
      }
      minHint={i18n("settings.elementBorderRadiusSharp")}
      maxHint={i18n("settings.elementBorderRadiusDefault")}
      onDraftChange={applyPreviewCssVars}
    />
  );
}

function HeroOverlayOpacitySlider({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => void;
}) {
  const { t: i18n } = useAdminT();

  return (
    <DebouncedRangeSlider
      id="hero-overlay-opacity"
      value={value}
      onSave={onSave}
      min={MIN_HERO_OVERLAY_OPACITY}
      max={MAX_HERO_OVERLAY_OPACITY}
      label={i18n("settings.heroOverlayOpacity")}
      description={i18n("settings.heroOverlayOpacityDesc")}
      formatValue={(v, locale) =>
        `${formatAdminDigits(String(v), locale)}%`
      }
      minHint={i18n("settings.heroOverlayOpacityNone")}
      maxHint={i18n("settings.heroOverlayOpacityDark")}
    />
  );
}

export function SettingsPanel() {
  const { t: i18n, locale } = useAdminT();
  const { upload, getUpload, isUploading, isAnyUploading } = useFileUpload();
  const logoUpload = getUpload("logo");
  const faviconUpload = getUpload("favicon");
  const heroImageUpload = getUpload("hero-image");
  const heroPosterUpload = getUpload("hero-poster");
  const heroVideoUpload = getUpload("hero-video");
  const eventImageUpload = getUpload("event-image");
  const eventVideoUpload = getUpload("event-video");
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tab, setTab] = useState<TabId>("general");
  const [eventDialog, setEventDialog] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT_FORM });
  const [eventMediaType, setEventMediaType] = useState<"image" | "video">("image");
  const [savingEvent, setSavingEvent] = useState(false);
  const eventSensors = useSensors(useSensor(PointerSensor));

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
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      toast.success(i18n("settings.saved"));
      load();
    } catch {
      toast.error(i18n("settings.saveFailed"));
    }
  }

  function openCreateEventDialog() {
    setEditingEventId(null);
    setEventForm({ ...EMPTY_EVENT_FORM });
    setEventMediaType("image");
    setEventDialog(true);
  }

  function openEditEventDialog(event: EventRow) {
    setEditingEventId(event.id);
    const mediaType = resolveEventMediaType(event.image, event.video);
    setEventForm({
      title: event.title ?? "",
      description: event.description ?? "",
      image: mediaType === "image" ? (event.image ?? "") : "",
      video: mediaType === "video" ? (event.video ?? "") : "",
      startDate: toDateInputValue(event.startDate),
      endDate: toDateInputValue(event.endDate),
      overlayOpacity: resolveEventOverlayOpacity(event.overlayOpacity),
      isActive: event.isActive,
    });
    setEventMediaType(mediaType);
    setEventDialog(true);
  }

  function closeEventDialog() {
    setEventDialog(false);
    setEditingEventId(null);
    setEventForm({ ...EMPTY_EVENT_FORM });
    setEventMediaType("image");
  }

  async function toggleEventActive(event: EventRow, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      setEvents((prev) =>
        prev.map((row) => (row.id === event.id ? { ...row, isActive } : row))
      );
      toast.success(i18n("settings.eventUpdated"));
    } catch {
      toast.error(i18n("settings.saveFailed"));
    }
  }

  async function onEventDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = events.findIndex((row) => row.id === active.id);
    const newIndex = events.findIndex((row) => row.id === over.id);
    const reordered = arrayMove(events, oldIndex, newIndex);
    setEvents(reordered);
    await fetch("/api/admin/events/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((row) => row.id) }),
    });
    toast.success(i18n("settings.eventOrderUpdated"));
  }

  async function saveEvent() {
    if (eventForm.image && eventForm.video) {
      toast.error(i18n("settings.eventMediaHint"));
      return;
    }

    setSavingEvent(true);
    try {
      const payload = {
        title: eventForm.title.trim() || null,
        description: normalizeAdminDigits(eventForm.description.trim()) || null,
        image: eventMediaType === "image" ? eventForm.image || null : null,
        video: eventMediaType === "video" ? eventForm.video || null : null,
        startDate: eventForm.startDate || null,
        endDate: eventForm.endDate || null,
        overlayOpacity: resolveEventOverlayOpacity(eventForm.overlayOpacity),
        isActive: eventForm.isActive,
      };
      const res = await fetch(
        editingEventId ? `/api/admin/events/${editingEventId}` : "/api/admin/events",
        {
          method: editingEventId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed");
      closeEventDialog();
      toast.success(
        editingEventId ? i18n("settings.eventUpdated") : i18n("settings.eventCreated")
      );
      load();
    } catch {
      toast.error(i18n("settings.saveFailed"));
    } finally {
      setSavingEvent(false);
    }
  }

  const general = (settings.general ?? {}) as Record<string, unknown>;
  const hero = (settings.hero ?? {}) as Record<string, unknown>;
  const worldCup = normalizeWorldCupSettings(settings.worldCup);
  const contact = (settings.contact ?? {}) as Record<string, unknown>;
  const mapsConfig = normalizeMapsSettings(settings.maps);
  const languages = (settings.languages ?? {}) as {
    enabled?: string[];
    default?: string;
  };
  const workingHours = (contact.workingHours ?? {}) as Record<string, unknown>;
  const days = (workingHours.days ?? {}) as Record<string, DayHours>;
  const heroMediaType =
    hero.mediaType === "image" || hero.mediaType === "video"
      ? (hero.mediaType as "image" | "video")
      : (hero.videoUrl as string)
        ? "video"
        : "image";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide lg:block lg:w-[200px] lg:shrink-0 lg:space-y-1 lg:overflow-visible lg:pb-0">
        {SETTINGS_TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-start text-sm transition-colors lg:w-full",
                tab === tabItem.id
                  ? "bg-[var(--admin-accent)]/10 font-medium text-[var(--admin-accent)]"
                  : "text-[var(--admin-muted)] hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {i18n(`settings.tabs.${tabItem.id}`)}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "general" && (
          <Card>
            <CardContent className="space-y-6 p-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">
                    {i18n("settings.sectionBrand")}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {i18n("settings.sectionBrandDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.logo")}</Label>
                  <label
                    className={cn(
                      "flex h-[120px] w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed",
                      isUploading("logo") && "pointer-events-none opacity-60"
                    )}
                  >
                    {typeof general.logo === "string" && general.logo ? (
                      <Image src={general.logo} alt="" width={120} height={120} className="object-cover" />
                    ) : (
                      <span className="text-xs text-[var(--admin-muted)]">{i18n("common.upload")}</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading("logo")}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = "";
                        try {
                          const url = await upload("logo", file);
                          save({ general: { ...general, logo: url } });
                        } catch {
                          toast.error(i18n("settings.saveFailed"));
                        }
                      }}
                    />
                  </label>
                  <UploadProgressBar
                    progress={logoUpload?.progress ?? null}
                    fileName={logoUpload?.fileName}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.favicon")}</Label>
                  <label
                    className={cn(
                      "flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed",
                      isUploading("favicon") && "pointer-events-none opacity-60"
                    )}
                  >
                    {typeof general.favicon === "string" && general.favicon ? (
                      <Image src={general.favicon} alt="" width={64} height={64} className="object-contain" />
                    ) : (
                      <span className="text-xs text-[var(--admin-muted)]">{i18n("common.upload")}</span>
                    )}
                    <input
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      disabled={isUploading("favicon")}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = "";
                        try {
                          const url = await upload("favicon", file);
                          save({ general: { ...general, favicon: url } });
                        } catch {
                          toast.error(i18n("settings.saveFailed"));
                        }
                      }}
                    />
                  </label>
                  <UploadProgressBar
                    progress={faviconUpload?.progress ?? null}
                    fileName={faviconUpload?.fileName}
                  />
                  <p className="text-xs text-[var(--admin-muted)]">{i18n("settings.faviconHint")}</p>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.cafeName")}</Label>
                  <Input
                    defaultValue={general.cafeName as string}
                    className="font-admin-fa"
                    onBlur={(e) =>
                      save({ general: { ...general, cafeName: e.target.value } })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.welcomeMessage")}</Label>
                  <Textarea
                    defaultValue={general.welcomeMessageFa as string}
                    className="font-admin-fa"
                    rows={3}
                    onBlur={(e) =>
                      save({
                        general: { ...general, welcomeMessageFa: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Label>{i18n("settings.menuColor")}</Label>
                  <input
                    type="color"
                    defaultValue={(general.menuColor as string) ?? DEFAULT_MENU_COLOR}
                    onBlur={(e) =>
                      save({ general: { ...general, menuColor: e.target.value } })
                    }
                    className="h-10 w-16 rounded border"
                  />
                  <Input
                    className="w-28 font-mono"
                    dir="ltr"
                    defaultValue={(general.menuColor as string) ?? DEFAULT_MENU_COLOR}
                    onBlur={(e) => {
                      const value = e.target.value.trim();
                      if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                        save({ general: { ...general, menuColor: value } });
                      }
                    }}
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-[var(--admin-border)] pt-6">
                <div>
                  <h3 className="text-base font-semibold">
                    {i18n("settings.sectionLayout")}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {i18n("settings.sectionLayoutDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.menuMaxWidth")}</Label>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {i18n("settings.menuMaxWidthDesc")}
                  </p>
                  <Select
                    value={(general.menuMaxWidth as string) ?? DEFAULT_MENU_MAX_WIDTH}
                    onValueChange={(v) =>
                      save({ general: { ...general, menuMaxWidth: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MENU_MAX_WIDTH_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {i18n(`settings.menuMaxWidth${preset.charAt(0).toUpperCase()}${preset.slice(1)}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ElementBorderRadiusSlider
                  value={resolveElementBorderRadius(general.elementBorderRadius)}
                  onSave={(elementBorderRadius) =>
                    save({ general: { ...general, elementBorderRadius } })
                  }
                />
              </section>

              <section className="space-y-4 border-t border-[var(--admin-border)] pt-6">
                <div>
                  <h3 className="text-base font-semibold">
                    {i18n("settings.sectionHeaderNav")}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {i18n("settings.sectionHeaderNavDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.headerBackground")}</Label>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {i18n("settings.headerBackgroundDesc")}
                  </p>
                  <Select
                    value={(general.headerBackground as string) ?? "white-to-glass"}
                    onValueChange={(v) =>
                      save({ general: { ...general, headerBackground: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">
                        {i18n("settings.headerBackgroundGlass")}
                      </SelectItem>
                      <SelectItem value="white">
                        {i18n("settings.headerBackgroundWhite")}
                      </SelectItem>
                      <SelectItem value="white-to-glass">
                        {i18n("settings.headerBackgroundWhiteToGlass")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.categoryTabsBackground")}</Label>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {i18n("settings.categoryTabsBackgroundDesc")}
                  </p>
                  <Select
                    value={(general.categoryTabsBackground as string) ?? "glass"}
                    onValueChange={(v) =>
                      save({ general: { ...general, categoryTabsBackground: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glass">
                        {i18n("settings.categoryTabsBackgroundGlass")}
                      </SelectItem>
                      <SelectItem value="white">
                        {i18n("settings.categoryTabsBackgroundWhite")}
                      </SelectItem>
                      <SelectItem value="white-to-glass">
                        {i18n("settings.categoryTabsBackgroundWhiteToGlass")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="scroll-progress" className="font-admin-fa cursor-pointer">
                      {i18n("settings.scrollProgress")}
                    </Label>
                    <p className="text-xs text-[var(--admin-muted)]">
                      {i18n("settings.scrollProgressDesc")}
                    </p>
                  </div>
                  <Switch
                    id="scroll-progress"
                    checked={general.scrollProgressEnabled !== false}
                    onCheckedChange={(v) =>
                      save({ general: { ...general, scrollProgressEnabled: v } })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="share-enabled" className="font-admin-fa cursor-pointer">
                      {i18n("settings.shareEnabled")}
                    </Label>
                    <p className="text-xs text-[var(--admin-muted)]">
                      {i18n("settings.shareEnabledHint")}
                    </p>
                  </div>
                  <Switch
                    id="share-enabled"
                    checked={general.shareEnabled !== false}
                    onCheckedChange={(v) =>
                      save({ general: { ...general, shareEnabled: v } })
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="scroll-to-top" className="font-admin-fa cursor-pointer">
                      {i18n("settings.scrollToTop")}
                    </Label>
                    <p className="text-xs text-[var(--admin-muted)]">
                      {i18n("settings.scrollToTopDesc")}
                    </p>
                  </div>
                  <Switch
                    id="scroll-to-top"
                    checked={general.scrollToTopEnabled !== false}
                    onCheckedChange={(v) =>
                      save({ general: { ...general, scrollToTopEnabled: v } })
                    }
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-[var(--admin-border)] pt-6">
                <div>
                  <h3 className="text-base font-semibold">
                    {i18n("settings.sectionHero")}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {i18n("settings.sectionHeroDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.heroSection")}</Label>
                  <p className="text-xs text-[var(--admin-muted)]">
                    {i18n("settings.heroSectionDesc")}
                  </p>
                  <Select
                    value={heroMediaType}
                    onValueChange={(v) =>
                      save({ hero: { ...hero, mediaType: v } })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">
                        {i18n("settings.heroTypeImage")}
                      </SelectItem>
                      <SelectItem value="video">
                        {i18n("settings.heroTypeVideo")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <HeroOverlayOpacitySlider
                  value={resolveHeroOverlayOpacity(hero.overlayOpacity)}
                  onSave={(overlayOpacity) =>
                    save({ hero: { ...hero, overlayOpacity } })
                  }
                />
                {heroMediaType === "image" ? (
                    <div className="space-y-2">
                      <Label>{i18n("settings.heroImage")}</Label>
                      <label
                        className={cn(
                          "flex h-32 w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed",
                          isUploading("hero-image") && "pointer-events-none opacity-60"
                        )}
                      >
                        {typeof hero.poster === "string" && hero.poster ? (
                          <Image
                            src={hero.poster}
                            alt=""
                            width={320}
                            height={128}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[var(--admin-muted)]">
                            {i18n("common.upload")}
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading("hero-image")}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = "";
                            try {
                              const url = await upload("hero-image", file);
                              save({ hero: { ...hero, poster: url } });
                            } catch {
                              toast.error(i18n("settings.saveFailed"));
                            }
                          }}
                        />
                      </label>
                      <UploadProgressBar
                        progress={heroImageUpload?.progress ?? null}
                        fileName={heroImageUpload?.fileName}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>{i18n("settings.heroVideoPoster")}</Label>
                        <label
                          className={cn(
                            "flex h-32 w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed",
                            isUploading("hero-poster") && "pointer-events-none opacity-60"
                          )}
                        >
                          {typeof hero.poster === "string" && hero.poster ? (
                            <Image
                              src={hero.poster}
                              alt=""
                              width={320}
                              height={128}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-[var(--admin-muted)]">
                              {i18n("common.upload")}
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading("hero-poster")}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              e.target.value = "";
                              try {
                                const url = await upload("hero-poster", file);
                                save({ hero: { ...hero, poster: url } });
                              } catch {
                                toast.error(i18n("settings.saveFailed"));
                              }
                            }}
                          />
                        </label>
                        <UploadProgressBar
                          progress={heroPosterUpload?.progress ?? null}
                          fileName={heroPosterUpload?.fileName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{i18n("settings.heroVideoUrl")}</Label>
                        <Input
                          dir="ltr"
                          className="font-mono text-xs"
                          defaultValue={(hero.videoUrl as string) ?? ""}
                          placeholder="https://"
                          onBlur={(e) =>
                            save({ hero: { ...hero, videoUrl: e.target.value } })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{i18n("settings.heroVideoUpload")}</Label>
                        <Input
                          type="file"
                          accept="video/*"
                          disabled={isUploading("hero-video")}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            e.target.value = "";
                            try {
                              const url = await upload("hero-video", file);
                              save({ hero: { ...hero, videoUrl: url } });
                            } catch {
                              toast.error(i18n("settings.saveFailed"));
                            }
                          }}
                        />
                        <UploadProgressBar
                          progress={heroVideoUpload?.progress ?? null}
                          fileName={heroVideoUpload?.fileName}
                        />
                        <p className="text-xs text-[var(--admin-muted)]">
                          {i18n("settings.heroVideoUploadHint")}
                        </p>
                      </div>
                    </>
                  )}
                <div className="space-y-4 border-t border-[var(--admin-border)] pt-4">
                  <div>
                    <h4 className="text-sm font-semibold">
                      {i18n("settings.worldCupSection")}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      {i18n("settings.worldCupSectionDesc")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label>{i18n("settings.worldCupEnabled")}</Label>
                      <p className="text-xs text-[var(--admin-muted)]">
                        {i18n("settings.worldCupEnabledDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={worldCup.enabled}
                      onCheckedChange={(enabled) =>
                        save({ worldCup: { ...worldCup, enabled } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{i18n("settings.worldCupBackgroundStyle")}</Label>
                    <Select
                      value={worldCup.backgroundStyle}
                      onValueChange={(backgroundStyle) =>
                        save({ worldCup: { ...worldCup, backgroundStyle } })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="glass-black">
                          {i18n("settings.worldCupBackgroundGlassBlack")}
                        </SelectItem>
                        <SelectItem value="glass-white">
                          {i18n("settings.worldCupBackgroundGlassWhite")}
                        </SelectItem>
                        <SelectItem value="white">
                          {i18n("settings.worldCupBackgroundWhite")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="world-cup-data-url">
                      {i18n("settings.worldCupDataUrl")}
                    </Label>
                    <Input
                      id="world-cup-data-url"
                      defaultValue={worldCup.dataUrl}
                      placeholder={DEFAULT_WORLD_CUP_DATA_URL}
                      onBlur={(e) =>
                        save({
                          worldCup: {
                            ...worldCup,
                            dataUrl: e.target.value.trim() || DEFAULT_WORLD_CUP_DATA_URL,
                          },
                        })
                      }
                    />
                    <p className="text-xs text-[var(--admin-muted)]">
                      {i18n("settings.worldCupDataUrlDesc")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="world-cup-timezone">
                      {i18n("settings.worldCupTimezone")}
                    </Label>
                    <Input
                      id="world-cup-timezone"
                      defaultValue={worldCup.timezone}
                      placeholder={DEFAULT_WORLD_CUP_TIMEZONE}
                      onBlur={(e) =>
                        save({
                          worldCup: {
                            ...worldCup,
                            timezone:
                              e.target.value.trim() || DEFAULT_WORLD_CUP_TIMEZONE,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="world-cup-max-matches">
                      {i18n("settings.worldCupMaxMatches")}
                    </Label>
                    <Input
                      id="world-cup-max-matches"
                      type="number"
                      min={1}
                      max={10}
                      defaultValue={worldCup.maxMatches}
                      onBlur={(e) => {
                        const parsed = Number(e.target.value);
                        save({
                          worldCup: {
                            ...worldCup,
                            maxMatches:
                              Number.isFinite(parsed) && parsed > 0
                                ? Math.min(10, Math.floor(parsed))
                                : 5,
                          },
                        });
                      }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="world-cup-title-fa">
                        {i18n("settings.worldCupTitleFa")}
                      </Label>
                      <Input
                        id="world-cup-title-fa"
                        defaultValue={worldCup.titleFa}
                        onBlur={(e) =>
                          save({
                            worldCup: { ...worldCup, titleFa: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="world-cup-title-en">
                        {i18n("settings.worldCupTitleEn")}
                      </Label>
                      <Input
                        id="world-cup-title-en"
                        defaultValue={worldCup.titleEn}
                        onBlur={(e) =>
                          save({
                            worldCup: { ...worldCup, titleEn: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        )}

        {tab === "announcement" && <AnnouncementManager />}

        {tab === "events" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openCreateEventDialog}>
                <Plus className="mr-2 h-4 w-4" />
                {i18n("settings.addEvent")}
              </Button>
            </div>
            {events.length > 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">
                {i18n("settings.eventReorderHint")}
              </p>
            ) : null}
            <DndContext
              sensors={eventSensors}
              collisionDetection={closestCenter}
              onDragEnd={onEventDragEnd}
            >
              <SortableContext
                items={events.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid gap-3">
                  {events.map((event) => (
                    <SortableEventCard
                      key={event.id}
                      event={event}
                      locale={locale}
                      onToggleActive={toggleEventActive}
                      onEdit={openEditEventDialog}
                      onDelete={setDeleteEventId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {tab === "contact" && (
          <Card>
            <CardContent className="space-y-6 p-6">
              <section className="space-y-4">
                <h3 className="text-base font-semibold">
                  {i18n("settings.contactInfo")}
                </h3>
                <div className="space-y-2">
                  <Label>{i18n("settings.phone")}</Label>
                  <AdminLocaleDigitInput
                    dir="ltr"
                    value={(contact.phone as string) ?? ""}
                    onSave={(phone) =>
                      save({ contact: { ...contact, phone } })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.instagram")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]">
                      @
                    </span>
                    <AdminLocaleDigitInput
                      dir="ltr"
                      className="pl-7"
                      value={(contact.instagram as string) ?? ""}
                      onSave={(instagram) =>
                        save({ contact: { ...contact, instagram } })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("settings.telegram")}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]">
                      @
                    </span>
                    <AdminLocaleDigitInput
                      dir="ltr"
                      className="pl-7"
                      value={(contact.telegram as string) ?? ""}
                      onSave={(telegram) =>
                        save({ contact: { ...contact, telegram } })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{i18n("common.email")}</Label>
                  <Input
                    type="email"
                    defaultValue={contact.email as string}
                    onBlur={(e) =>
                      save({ contact: { ...contact, email: e.target.value } })
                    }
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-[var(--admin-border)] pt-6">
                <h3 className="text-base font-semibold">
                  {i18n("settings.location")}
                </h3>
                {LANGUAGES.map((lang) => {
                  const places = (contact.places as StoredPlace[]) ?? [];
                  const place = places[0] ?? {};
                  const translation =
                    getPlaceTranslations(place).find(
                      (tr) => tr.language === lang.code
                    ) ?? { language: lang.code, address: "" };

                  return (
                    <div
                      key={lang.code}
                      className="space-y-3 rounded-lg border border-[var(--admin-border)] px-4 py-3"
                    >
                      <LanguageLabel
                        code={lang.code}
                        variant="badge"
                        required={false}
                        optional={false}
                      />
                      <div className="space-y-2">
                        <Label>{i18n("settings.placeAddress")}</Label>
                        {lang.code === "fa" ? (
                          <AdminLocaleDigitTextarea
                            key={`${lang.code}-address-${translation.address}`}
                            rows={3}
                            value={translation.address}
                            onSave={(address) =>
                              save({
                                contact: {
                                  ...contact,
                                  places: updatePlaceTranslation(
                                    places,
                                    0,
                                    lang.code,
                                    "address",
                                    address
                                  ),
                                },
                              })
                            }
                          />
                        ) : (
                          <Textarea
                            key={`${lang.code}-address-${translation.address}`}
                            defaultValue={translation.address}
                            rows={3}
                            onBlur={(e) =>
                              save({
                                contact: {
                                  ...contact,
                                  places: updatePlaceTranslation(
                                    places,
                                    0,
                                    lang.code,
                                    "address",
                                    e.target.value
                                  ),
                                },
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>

              <section className="space-y-3 border-t border-[var(--admin-border)] pt-6">
                <h3 className="text-base font-semibold">
                  {i18n("settings.sectionMaps")}
                </h3>
                {MAP_PROVIDERS.map(({ key, labelKey }) => {
                  const enabled = mapsConfig.enabled.includes(key);
                  const url = mapsConfig.urls[key] ?? "";
                  return (
                    <div
                      key={key}
                      className={cn(
                        "space-y-3 rounded-lg border border-[var(--admin-border)] px-4 py-3",
                        !enabled && "bg-gray-50/60"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <MapProviderLabel provider={key} muted={!enabled} />
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => {
                            const enabledSet = new Set(mapsConfig.enabled);
                            if (checked) enabledSet.add(key);
                            else enabledSet.delete(key);
                            save({
                              maps: {
                                urls: mapsConfig.urls,
                                enabled: MAP_PROVIDER_KEYS.filter((k) =>
                                  enabledSet.has(k)
                                ),
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={`map-url-${key}`}
                          className="text-xs font-normal text-[var(--admin-muted)]"
                        >
                          {i18n(labelKey)}
                        </Label>
                        <Input
                          id={`map-url-${key}`}
                          dir="ltr"
                          className={cn(
                            "font-mono text-xs",
                            !enabled && "cursor-not-allowed bg-gray-100/80 opacity-60"
                          )}
                          disabled={!enabled}
                          defaultValue={url}
                          placeholder="https://"
                          title={url || undefined}
                          onBlur={(e) =>
                            save({
                              maps: {
                                urls: { ...mapsConfig.urls, [key]: e.target.value },
                                enabled: mapsConfig.enabled,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </section>
            </CardContent>
          </Card>
        )}

        {tab === "hours" && (
          <Card>
            <CardContent className="space-y-4 p-6">
              {WEEKDAY_KEYS.map((key) => {
                const day = days[key] ?? { open: true, start: "08:00", end: "23:00" };
                return (
                  <div key={key} className="space-y-3 rounded-lg border border-[var(--admin-border)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium font-admin-fa">{i18n(`settings.weekdays.${key}`)}</span>
                      <Switch
                        checked={day.open}
                        onCheckedChange={(v) =>
                          save({
                            contact: {
                              ...contact,
                              workingHours: {
                                ...workingHours,
                                days: { ...days, [key]: { ...day, open: v } },
                              },
                            },
                          })
                        }
                      />
                    </div>
                    {day.open && (
                      <div className="flex flex-wrap items-center gap-2">
                        <AdminTimePicker
                          value={day.start}
                          onChange={(start) =>
                            save({
                              contact: {
                                ...contact,
                                workingHours: {
                                  ...workingHours,
                                  days: {
                                    ...days,
                                    [key]: { ...day, start },
                                  },
                                },
                              },
                            })
                          }
                        />
                        <span className="text-[var(--admin-muted)]">–</span>
                        <AdminTimePicker
                          value={day.end}
                          onChange={(end) =>
                            save({
                              contact: {
                                ...contact,
                                workingHours: {
                                  ...workingHours,
                                  days: {
                                    ...days,
                                    [key]: { ...day, end },
                                  },
                                },
                              },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="space-y-2">
                <Label>{i18n("settings.specialNotes")}</Label>
                <Textarea
                  className="font-admin-fa"
                  defaultValue={workingHours.note as string}
                  onBlur={(e) =>
                    save({
                      contact: {
                        ...contact,
                        workingHours: { ...workingHours, note: e.target.value },
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "languages" && (
          <Card>
            <CardContent className="space-y-4 p-6">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <LanguageLabel code={lang.code} variant="badge" />
                  <Switch
                    defaultChecked={
                      languages.enabled?.includes(lang.code) ?? true
                    }
                    onCheckedChange={(checked) => {
                      const enabled = new Set(
                        languages.enabled ?? LANGUAGES.map((l) => l.code)
                      );
                      if (checked) enabled.add(lang.code);
                      else enabled.delete(lang.code);
                      save({
                        languages: {
                          ...languages,
                          enabled: Array.from(enabled),
                        },
                      });
                    }}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label>{i18n("settings.defaultLanguage")}</Label>
                <Select
                  defaultValue={languages.default ?? "fa"}
                  onValueChange={(v) =>
                    save({ languages: { ...languages, default: v } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        <LanguageLabel code={l.code} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={eventDialog}
        onOpenChange={(open) => {
          if (!open) closeEventDialog();
          else setEventDialog(true);
        }}
      >
        <AdminDialogContent className="max-h-[min(90vh,820px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEventId ? i18n("settings.editEvent") : i18n("settings.addEvent")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{i18n("settings.eventTitle")}</Label>
              <Input
                placeholder={i18n("settings.eventTitle")}
                value={eventForm.title}
                className={locale === "fa" ? "font-admin-fa" : undefined}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{i18n("settings.eventDescription")}</Label>
              {locale === "fa" ? (
                <AdminLocaleDigitTextarea
                  key={`event-desc-${editingEventId ?? "new"}`}
                  placeholder={i18n("settings.eventDescription")}
                  rows={4}
                  dir="rtl"
                  className="text-start"
                  value={eventForm.description}
                  onSave={(description) =>
                    setEventForm((prev) => ({ ...prev, description }))
                  }
                />
              ) : (
                <Textarea
                  placeholder={i18n("settings.eventDescription")}
                  value={eventForm.description}
                  rows={4}
                  className="text-start"
                  onChange={(e) =>
                    setEventForm({ ...eventForm, description: e.target.value })
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>{i18n("settings.eventImage")}</Label>
              <Select
                value={eventMediaType}
                onValueChange={(value: "image" | "video") => {
                  setEventMediaType(value);
                  setEventForm((prev) =>
                    value === "image" ? { ...prev, video: "" } : { ...prev, image: "" }
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">{i18n("settings.heroTypeImage")}</SelectItem>
                  <SelectItem value="video">{i18n("settings.heroTypeVideo")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--admin-muted)]">
                {i18n("settings.eventMediaHint")}
              </p>
              {eventMediaType === "image" ? (
                <label
                  className={cn(
                    "flex h-32 w-full max-w-sm cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed",
                    isUploading("event-image") && "pointer-events-none opacity-60"
                  )}
                >
                  {eventForm.image ? (
                    <Image
                      src={eventForm.image}
                      alt=""
                      width={320}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[var(--admin-muted)]">
                      {i18n("common.upload")}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading("event-image")}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = "";
                      try {
                        const url = await upload("event-image", file);
                        setEventForm((prev) => ({ ...prev, image: url, video: "" }));
                        setEventMediaType("image");
                      } catch {
                        toast.error(i18n("settings.saveFailed"));
                      }
                    }}
                  />
                </label>
              ) : eventForm.video ? (
                <div className="space-y-2">
                  <video
                    src={eventForm.video}
                    className="h-32 w-full max-w-sm rounded-lg border object-cover"
                    controls
                    playsInline
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading("event-video")}
                      onClick={() => setEventForm((prev) => ({ ...prev, video: "" }))}
                    >
                      {i18n("settings.eventVideoRemove")}
                    </Button>
                    <Input
                      type="file"
                      accept="video/*"
                      className="max-w-xs"
                      disabled={isUploading("event-video")}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = "";
                        try {
                          const url = await upload("event-video", file);
                          setEventForm((prev) => ({ ...prev, video: url, image: "" }));
                          setEventMediaType("video");
                        } catch {
                          toast.error(i18n("settings.saveFailed"));
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="video/*"
                  disabled={isUploading("event-video")}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    try {
                      const url = await upload("event-video", file);
                      setEventForm((prev) => ({ ...prev, video: url, image: "" }));
                      setEventMediaType("video");
                    } catch {
                      toast.error(i18n("settings.saveFailed"));
                    }
                  }}
                />
              )}
              {eventMediaType === "image" ? (
                <UploadProgressBar
                  progress={eventImageUpload?.progress ?? null}
                  fileName={eventImageUpload?.fileName}
                />
              ) : (
                <UploadProgressBar
                  progress={eventVideoUpload?.progress ?? null}
                  fileName={eventVideoUpload?.fileName}
                />
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{i18n("settings.eventStartDate")}</Label>
                <AdminDatePicker
                  value={eventForm.startDate}
                  placeholder={i18n("settings.eventStartDate")}
                  onChange={(startDate) => setEventForm({ ...eventForm, startDate })}
                />
              </div>
              <div className="space-y-2">
                <Label>{i18n("settings.eventEndDate")}</Label>
                <AdminDatePicker
                  value={eventForm.endDate}
                  placeholder={i18n("settings.eventEndDate")}
                  onChange={(endDate) => setEventForm({ ...eventForm, endDate })}
                />
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-[var(--admin-border)] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="event-overlay-opacity">{i18n("settings.eventOverlayOpacity")}</Label>
                <span className="text-sm text-[var(--admin-muted)]">
                  {formatAdminDigits(String(eventForm.overlayOpacity), locale)}%
                </span>
              </div>
              <p className="text-xs text-[var(--admin-muted)]">
                {i18n("settings.eventOverlayOpacityDesc")}
              </p>
              <input
                id="event-overlay-opacity"
                type="range"
                min={MIN_EVENT_OVERLAY_OPACITY}
                max={MAX_EVENT_OVERLAY_OPACITY}
                step={1}
                value={eventForm.overlayOpacity}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    overlayOpacity: resolveEventOverlayOpacity(Number(e.target.value)),
                  })
                }
                className="w-full accent-[var(--admin-primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--admin-muted)]">
                <span>{i18n("settings.eventOverlayOpacityNone")}</span>
                <span>{i18n("settings.eventOverlayOpacityDark")}</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] px-4 py-3">
              <Label htmlFor="event-form-active">{i18n("common.active")}</Label>
              <Switch
                id="event-form-active"
                checked={eventForm.isActive}
                onCheckedChange={(v) => setEventForm({ ...eventForm, isActive: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEventDialog} disabled={savingEvent || isAnyUploading}>
              {i18n("common.cancel")}
            </Button>
            <Button onClick={() => void saveEvent()} disabled={savingEvent || isAnyUploading}>
              {i18n("common.save")}
            </Button>
          </DialogFooter>
        </AdminDialogContent>
      </Dialog>

      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AdminAlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n("settings.deleteEventTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n("settings.deleteEventDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--admin-danger)] hover:bg-red-700"
              onClick={async () => {
                if (!deleteEventId) return;
                await fetch(`/api/admin/events/${deleteEventId}`, {
                  method: "DELETE",
                });
                setDeleteEventId(null);
                toast.success(i18n("settings.eventDeleted"));
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
