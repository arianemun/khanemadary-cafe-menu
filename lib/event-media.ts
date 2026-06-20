export function normalizeEventMedia(
  image: string | null | undefined,
  video: string | null | undefined
): { image: string | null; video: string | null } {
  const img = image || null;
  const vid = video || null;

  if (vid) return { image: null, video: vid };
  if (img) return { image: img, video: null };
  return { image: null, video: null };
}

export function resolveEventMediaType(
  image: string | null | undefined,
  video: string | null | undefined
): "image" | "video" {
  if (video) return "video";
  if (image) return "image";
  return "image";
}
