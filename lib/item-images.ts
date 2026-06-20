import type { MenuItem } from "./types";

export function getItemImages(item: Pick<MenuItem, "image" | "galleryImages">): string[] {
  const gallery = (item.galleryImages ?? [])
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url));

  const uniqueGallery = gallery.filter((url, index) => gallery.indexOf(url) === index);

  if (uniqueGallery.length > 0) {
    return uniqueGallery;
  }

  return item.image ? [item.image] : [];
}

export function isLocalUploadImage(src: string): boolean {
  return src.startsWith("/uploads/");
}
