import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createFullBackup, formatBackupFilename } from "@/lib/backup";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const buffer = await createFullBackup();
    const filename = formatBackupFilename();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "BACKUP_FAILED" }, { status: 500 });
  }
}
