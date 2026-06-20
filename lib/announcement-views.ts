const STORAGE_KEY = "cafe-announcement-views";

type ViewCounts = Record<string, number>;

function readViewCounts(): ViewCounts {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ViewCounts;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeViewCounts(counts: ViewCounts) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
}

export function getAnnouncementViewCount(id: string): number {
  return readViewCounts()[id] ?? 0;
}

export function incrementAnnouncementView(id: string): number {
  const counts = readViewCounts();
  const next = (counts[id] ?? 0) + 1;
  counts[id] = next;
  writeViewCounts(counts);
  return next;
}

export function canShowAnnouncement(id: string, maxDisplayCount: number): boolean {
  if (maxDisplayCount <= 0) return true;
  return getAnnouncementViewCount(id) < maxDisplayCount;
}
