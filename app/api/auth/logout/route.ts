import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.type === "admin") {
      await deleteSession("admin_session");
    } else {
      await deleteSession("session");
    }
  } catch (error) {
    await deleteSession("session");
  }
  return NextResponse.json({ message: "Logout berhasil" });
}
