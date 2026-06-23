import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Check multiple possible upload directories
    const pathsToCheck = [
      path.join(process.cwd(), "uploads", filename),
      path.join(process.cwd(), "public", "uploads", filename),
      path.join("/tmp", "uploads", filename)
    ];

    let filepath = null;
    for (const p of pathsToCheck) {
      if (existsSync(p)) {
        filepath = p;
        break;
      }
    }

    if (!filepath) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await readFile(filepath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".pdf") contentType = "application/pdf";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
