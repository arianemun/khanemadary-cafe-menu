import path from "path";

export function getDatabasePath() {
  return path.join(process.cwd(), "prisma", "cafe.db");
}

export function getDatabaseWalPath() {
  return `${getDatabasePath()}-wal`;
}

export function getDatabaseShmPath() {
  return `${getDatabasePath()}-shm`;
}
