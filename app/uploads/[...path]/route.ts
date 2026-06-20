import { readFile, stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getUploadMimeType, resolveUploadFilePath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filepath = resolveUploadFilePath(segments);
  if (!filepath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(filepath);
    if (!fileStat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = await readFile(filepath);
    const filename = segments[segments.length - 1] ?? "file";

    return new NextResponse(data, {
      headers: {
        "Content-Type": getUploadMimeType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
