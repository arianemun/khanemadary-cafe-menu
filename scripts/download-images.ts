import { mkdir, writeFile, readFile, access } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const REFERENCE_PATH = path.join(ROOT, "reference-content.json");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const MAP_PATH = path.join(ROOT, "scripts", "image-url-map.json");

const IMAGE_EXT = /\.(webp|jpe?g|png|gif|svg|avif)(\?.*)?$/i;

function isRemoteImageUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^https?:\/\//i.test(value) &&
    IMAGE_EXT.test(value)
  );
}

function localPathFromUrl(url: string): string {
  const filename = url.split("/").pop()?.split("?")[0] || "image.webp";
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `/images/${safe}`;
}

async function fileExists(filepath: string) {
  try {
    await access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(url: string, destPath: string) {
  if (await fileExists(destPath)) return;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
}

function collectUrls(value: unknown, urls: Set<string>) {
  if (isRemoteImageUrl(value)) {
    urls.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, urls));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((v) => collectUrls(v, urls));
  }
}

function replaceUrls<T>(value: T, map: Record<string, string>): T {
  if (typeof value === "string" && map[value]) {
    return map[value] as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceUrls(item, map)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceUrls(val, map);
    }
    return out as T;
  }
  return value;
}

async function main() {
  const raw = await readFile(REFERENCE_PATH, "utf-8");
  const data = JSON.parse(raw) as unknown;

  const urls = new Set<string>();
  collectUrls(data, urls);

  await mkdir(IMAGES_DIR, { recursive: true });

  const urlMap: Record<string, string> = {};

  for (const url of urls) {
    const localPath = localPathFromUrl(url);
    urlMap[url] = localPath;
    const dest = path.join(ROOT, "public", localPath.replace(/^\//, ""));
    console.log(`Downloading ${url} -> ${localPath}`);
    await downloadImage(url, dest);
  }

  const updated = replaceUrls(data, urlMap);
  await writeFile(REFERENCE_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf-8");
  await writeFile(MAP_PATH, `${JSON.stringify(urlMap, null, 2)}\n`, "utf-8");

  console.log(`Done. ${urls.size} images saved to public/images/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
