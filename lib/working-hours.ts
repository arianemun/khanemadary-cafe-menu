export const WEEKDAY_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

const KEY_TO_DAY: Record<WeekdayKey, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const WEEKDAY_TO_KEY: Record<number, WeekdayKey> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

type DayHours = { open: boolean; start: string; end: string };

export type DayScheduleEntry = {
  key: WeekdayKey;
  open: boolean;
  start: string;
  end: string;
};

function formatHourMinute(h: number, m: number): string {
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function normalizeWorkingHoursSchedule(
  config: WorkingHoursConfig
): DayScheduleEntry[] {
  const days = config.days;
  if (!days) {
    return WEEKDAY_KEYS.map((key) => ({
      key,
      open: false,
      start: "",
      end: "",
    }));
  }

  if (!Array.isArray(days)) {
    return WEEKDAY_KEYS.map((key) => {
      const day = days[key];
      return {
        key,
        open: day?.open ?? false,
        start: day?.start ?? "00:00",
        end: day?.end ?? "23:59",
      };
    });
  }

  const hours = config.hours;
  const start = hours ? formatHourMinute(hours.hs, hours.ms) : "";
  const end = hours ? formatHourMinute(hours.he, hours.me) : "";

  return WEEKDAY_KEYS.map((key) => ({
    key,
    open: days.includes(KEY_TO_DAY[key]),
    start,
    end,
  }));
}

export function getTodayWeekdayKey(now = new Date()): WeekdayKey {
  return WEEKDAY_TO_KEY[now.getDay()];
}

export type WorkingHoursConfig = {
  days?: Record<string, DayHours> | number[];
  hours?: { hs: number; he: number; ms: number; me: number };
};

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isCafeOpenBySchedule(
  config: WorkingHoursConfig,
  now = new Date()
): boolean {
  const days = config.days;
  if (!days) return false;

  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!Array.isArray(days)) {
    const key = WEEKDAY_TO_KEY[dayOfWeek];
    const day = days[key];
    if (!day?.open) return false;
    const start = parseTime(day.start || "00:00");
    const end = parseTime(day.end || "23:59");
    return currentMinutes >= start && currentMinutes < end;
  }

  if (!days.includes(dayOfWeek)) return false;
  const hours = config.hours;
  if (!hours) return false;
  const start = hours.hs * 60 + hours.ms;
  const end = hours.he * 60 + hours.me;
  return currentMinutes >= start && currentMinutes < end;
}

export function isCafeOpen(
  config: WorkingHoursConfig,
  forceClosed: boolean,
  now = new Date()
): boolean {
  if (forceClosed) return false;
  return isCafeOpenBySchedule(config, now);
}
