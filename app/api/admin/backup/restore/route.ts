import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { MAX_BACKUP_BYTES, restoreFullBackup } from "@/lib/backup";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "EMPTY_FILE" }, { status: 400 });
  }

  if (file.size > MAX_BACKUP_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    await restoreFullBackup(buffer);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "RESTORE_FAILED";

    if (message === "INVALID_SQLITE") {
      return NextResponse.json({ error: "INVALID_SQLITE" }, { status: 400 });
    }

    if (message === "INVALID_BACKUP") {
      return NextResponse.json({ error: "INVALID_BACKUP" }, { status: 400 });
    }

    if (message === "FILE_TOO_LARGE") {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    return NextResponse.json({ error: "RESTORE_FAILED" }, { status: 500 });
  }
}
