import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    // Dibaca di runtime, bukan build time
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')}`;

    // Pastikan direktori ada
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    console.log(`[Upload] File saved to: ${filepath}`);

    return NextResponse.json({ url: `/api/assets/${filename}` });
  } catch (error: any) {
    console.error("[Upload] Error:", error?.message || error);
    return NextResponse.json({ error: `Gagal mengunggah file: ${error?.message}` }, { status: 500 });
  }
}
