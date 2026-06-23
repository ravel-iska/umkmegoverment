import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Dibaca di runtime, bukan build time
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    // Di Next.js 15+, params harus di-await
    const { filename } = await params;

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    const filepath = path.join(uploadDir, filename);

    console.log(`[Assets] Looking for file: ${filepath}`);

    if (!existsSync(filepath)) {
      console.warn(`[Assets] File not found: ${filepath}`);
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await readFile(filepath);

    // Tentukan content type berdasarkan ekstensi
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".mov") contentType = "video/quicktime";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("[Assets] Error reading file:", error?.message || error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
