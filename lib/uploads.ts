import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "storage", "uploads");

export const UPLOAD_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export function getUploadMimeType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return UPLOAD_MIME_TYPES[ext] ?? "application/octet-stream";
}

export function resolveUploadFilePath(segments: string[]) {
  const filename = segments.join("/");
  if (!filename || filename.includes("..")) return null;

  const filepath = path.join(UPLOADS_DIR, filename);
  const resolvedUploadsDir = path.resolve(UPLOADS_DIR);
  const resolvedFilePath = path.resolve(filepath);
  if (
    resolvedFilePath !== resolvedUploadsDir &&
    !resolvedFilePath.startsWith(`${resolvedUploadsDir}${path.sep}`)
  ) {
    return null;
  }

  return resolvedFilePath;
}
