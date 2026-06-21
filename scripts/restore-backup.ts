import { readFile } from "fs/promises";
import { restoreFullBackup } from "../lib/backup";

async function main() {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error("Usage: tsx scripts/restore-backup.ts <path-to-backup.zip>");
    process.exit(1);
  }

  const buffer = await readFile(backupPath);
  const result = await restoreFullBackup(buffer);
  console.log("Restore complete:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
