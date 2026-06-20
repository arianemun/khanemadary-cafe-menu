import AdmZip from "adm-zip";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import os from "os";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  getDatabasePath,
  getDatabaseShmPath,
  getDatabaseWalPath,
} from "@/lib/db-path";
import { UPLOADS_DIR } from "@/lib/uploads";

const SQLITE_MAGIC = Buffer.from("SQLite format 3\0", "utf8");
export const MAX_BACKUP_BYTES = 500 * 1024 * 1024;

export const BACKUP_DB_ENTRY = "cafe.db";
export const BACKUP_UPLOADS_ENTRY = "uploads";

export function getUploadsPath() {
  return UPLOADS_DIR;
}

export function isSqliteBuffer(buffer: Buffer) {
  return buffer.length >= 16 && buffer.subarray(0, 16).equals(SQLITE_MAGIC);
}

function isZipBuffer(buffer: Buffer) {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
  );
}

async function pathExists(targetPath: string) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function checkpointDatabase() {
  try {
    await prisma.$executeRawUnsafe("PRAGMA wal_checkpoint(FULL)");
  } catch {
    // WAL mode may be unavailable; backup still proceeds from main db file.
  }
}

export async function readDatabaseBackup(): Promise<Buffer> {
  await checkpointDatabase();
  return readFile(getDatabasePath());
}

export function formatBackupFilename(date = new Date()) {
  const stamp = date
    .toISOString()
    .slice(0, 19)
    .replace(/[-:T]/g, (char) => (char === "T" ? "-" : char));
  return `khanemadary-backup-${stamp}.zip`;
}

async function removeWalFiles() {
  await Promise.all([
    unlink(getDatabaseWalPath()).catch(() => undefined),
    unlink(getDatabaseShmPath()).catch(() => undefined),
  ]);
}

async function createSafetyCopy(sourcePath: string, suffix: string) {
  if (!(await pathExists(sourcePath))) return null;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safetyPath = `${sourcePath}.${suffix}-${timestamp}.bak`;
  await cp(sourcePath, safetyPath, { recursive: true, force: true });
  return safetyPath;
}

async function restoreUploadsDirectory(sourceDir: string) {
  const uploadsPath = getUploadsPath();

  if (!(await pathExists(sourceDir))) {
    await rm(uploadsPath, { recursive: true, force: true }).catch(() => undefined);
    await mkdir(uploadsPath, { recursive: true });
    return;
  }

  const tempUploadsPath = `${uploadsPath}.restore-tmp-${Date.now()}`;
  await mkdir(tempUploadsPath, { recursive: true });

  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    await copyFile(path.join(sourceDir, entry.name), path.join(tempUploadsPath, entry.name));
  }

  await rm(uploadsPath, { recursive: true, force: true }).catch(() => undefined);
  await mkdir(path.dirname(uploadsPath), { recursive: true });
  await cp(tempUploadsPath, uploadsPath, { recursive: true, force: true });
  await rm(tempUploadsPath, { recursive: true, force: true });
}

async function writeDatabaseFile(buffer: Buffer) {
  const dbPath = getDatabasePath();
  await writeFile(dbPath, buffer);
  await removeWalFiles();
}

export async function createFullBackup(): Promise<Buffer> {
  const dbBuffer = await readDatabaseBackup();
  const zip = new AdmZip();
  zip.addFile(BACKUP_DB_ENTRY, dbBuffer);

  const uploadsPath = getUploadsPath();
  if (await pathExists(uploadsPath)) {
    zip.addLocalFolder(uploadsPath, BACKUP_UPLOADS_ENTRY);
  }

  return zip.toBuffer();
}

export async function restoreDatabaseBackup(buffer: Buffer) {
  if (!isSqliteBuffer(buffer)) {
    throw new Error("INVALID_SQLITE");
  }

  if (buffer.length > MAX_BACKUP_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const dbPath = getDatabasePath();
  const safetyBackupPath = await createSafetyCopy(dbPath, "pre-restore");

  await prisma.$disconnect();

  try {
    await writeDatabaseFile(buffer);
    await prisma.$connect();
  } catch (error) {
    if (safetyBackupPath) {
      try {
        await copyFile(safetyBackupPath, dbPath);
        await removeWalFiles();
        await prisma.$connect();
      } catch {
        // If rollback fails, leave the safety backup on disk for manual recovery.
      }
    }
    throw error;
  }
}

export async function restoreFullBackup(buffer: Buffer) {
  if (buffer.length > MAX_BACKUP_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  if (isSqliteBuffer(buffer)) {
    await restoreDatabaseBackup(buffer);
    return { restoredMedia: false };
  }

  if (!isZipBuffer(buffer)) {
    throw new Error("INVALID_BACKUP");
  }

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw new Error("INVALID_BACKUP");
  }

  const dbEntry = zip.getEntry(BACKUP_DB_ENTRY);
  if (!dbEntry || dbEntry.isDirectory) {
    throw new Error("INVALID_BACKUP");
  }

  const dbBuffer = dbEntry.getData();
  if (!isSqliteBuffer(dbBuffer)) {
    throw new Error("INVALID_SQLITE");
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "khanemadary-restore-"));
  const dbPath = getDatabasePath();
  const uploadsPath = getUploadsPath();
  const dbSafetyPath = await createSafetyCopy(dbPath, "pre-restore");
  const uploadsSafetyPath = await createSafetyCopy(uploadsPath, "pre-restore-uploads");

  await prisma.$disconnect();

  try {
    zip.extractAllTo(tempDir, true);
    await writeDatabaseFile(dbBuffer);
    await restoreUploadsDirectory(path.join(tempDir, BACKUP_UPLOADS_ENTRY));
    await prisma.$connect();
    return { restoredMedia: true };
  } catch (error) {
    try {
      if (dbSafetyPath && (await pathExists(dbSafetyPath))) {
        await copyFile(dbSafetyPath, dbPath);
        await removeWalFiles();
      }

      if (uploadsSafetyPath && (await pathExists(uploadsSafetyPath))) {
        await rm(uploadsPath, { recursive: true, force: true }).catch(() => undefined);
        await cp(uploadsSafetyPath, uploadsPath, { recursive: true, force: true });
      }

      await prisma.$connect();
    } catch {
      // Leave safety copies on disk for manual recovery.
    }
    throw error;
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
